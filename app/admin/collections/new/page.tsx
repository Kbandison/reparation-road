"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  X,
  Save
} from 'lucide-react';

const NewArchivePagePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptionInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    collection_slug: searchParams.get('collection') || '',
    book_no: 1,
    page_no: 1,
    title: '',
    year: new Date().getFullYear(),
    location: '',
    tags: [] as string[],
    ocr_text: '',
  });

  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'book_no' || name === 'page_no' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranscriptionDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      setTranscriptionFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData((prev) => ({ ...prev, ocr_text: text }));
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a valid text file (.txt)');
    }
  };

  const handleTranscriptionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        alert('Please select a text file (.txt)');
        return;
      }
      setTranscriptionFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData((prev) => ({ ...prev, ocr_text: text }));
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.collection_slug}/book-${formData.book_no}/page-${formData.page_no}.${fileExt}`;
      const filePath = `archives/${fileName}`;

      console.log('Uploading file to:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('archives')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      const { data } = supabase.storage.from('archives').getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImageToStorage:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      console.log('Starting form submission...');
      console.log('Form data:', formData);
      console.log('Image source:', imageSource);

      // Validate required fields
      if (!formData.collection_slug) {
        throw new Error('Collection slug is required');
      }

      // Get image path
      let imagePath = '';
      if (imageSource === 'url') {
        console.log('Using image URL:', imageUrl);
        imagePath = imageUrl;
      } else if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        imagePath = await uploadImageToStorage(imageFile);
      }

      if (!imagePath) {
        throw new Error('Please provide an image URL or upload an image file');
      }

      console.log('Final image path:', imagePath);

      // Create slug
      const slug = `${formData.collection_slug}-book-${formData.book_no}-page-${formData.page_no}`;
      console.log('Generated slug:', slug);

      // Insert into database
      console.log('Inserting into database...');
      const insertData = {
        collection_slug: formData.collection_slug,
        book_no: formData.book_no,
        page_no: formData.page_no,
        slug,
        image_path: imagePath,
        title: formData.title || null,
        year: formData.year || null,
        location: formData.location || null,
        tags: formData.tags,
        ocr_text: formData.ocr_text,
      };

      console.log('Insert data:', insertData);

      const { data: insertedData, error } = await supabase
        .from('archive_pages')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Insert successful:', insertedData);

      setMessage({ type: 'success', text: 'Page added successfully!' });

      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/collections?collection=${formData.collection_slug}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving page:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save page. Check console for details.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-brand-brown">Add New Archive Page</h1>
          <p className="text-gray-600 mt-2">
            Add a new page to the {formData.collection_slug || 'selected'} collection
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Collection Slug *
                </label>
                <Input
                  name="collection_slug"
                  value={formData.collection_slug}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., inspection-roll-of-negroes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Title (Optional)
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Page title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Book Number *
                </label>
                <Input
                  type="number"
                  name="book_no"
                  value={formData.book_no}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Page Number *
                </label>
                <Input
                  type="number"
                  name="page_no"
                  value={formData.page_no}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Year (Optional)
                </label>
                <Input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1600"
                  max="2100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Location (Optional)
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Virginia"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Document Image
            </h2>

            <div className="space-y-4">
              {/* Image Source Toggle */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    imageSource === 'url'
                      ? 'border-brand-green bg-brand-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LinkIcon className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">Image URL</p>
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    imageSource === 'upload'
                      ? 'border-brand-green bg-brand-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">Upload File</p>
                </button>
              </div>

              {/* URL Input */}
              {imageSource === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-1">
                    Image URL *
                  </label>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required={imageSource === 'url'}
                  />
                </div>
              )}

              {/* File Upload */}
              {imageSource === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {imageFile ? 'Change Image' : 'Select Image File'}
                  </Button>
                  {imageFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {(imagePreview || imageUrl) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-brand-brown mb-2">Preview</p>
                  <img
                    src={imagePreview || imageUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Transcription Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Transcription (OCR Text)
            </h2>

            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleTranscriptionDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-green transition-colors cursor-pointer"
                onClick={() => transcriptionInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-brand-brown font-medium mb-1">
                  Drag and drop a text file here
                </p>
                <p className="text-sm text-gray-500">or click to select a file</p>
                {transcriptionFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Loaded: {transcriptionFile.name}
                  </p>
                )}
              </div>

              <input
                ref={transcriptionInputRef}
                type="file"
                accept=".txt"
                onChange={handleTranscriptionFileSelect}
                className="hidden"
              />

              {/* Manual Text Input */}
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Or type/paste transcription text
                </label>
                <textarea
                  name="ocr_text"
                  value={formData.ocr_text}
                  onChange={handleInputChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green font-mono text-sm"
                  placeholder="Enter the transcribed text from the document..."
                />
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4">Tags</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-brand-tan text-brand-brown rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-green hover:bg-brand-darkgreen flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Page'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArchivePagePage;
