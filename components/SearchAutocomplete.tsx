"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  _collection: string;
  _collectionSlug: string;
  _identifier: string;
  _snippet: string;
  [key: string]: any;
}

interface SearchAutocompleteProps {
  onSearch: (query: string, isSubmit?: boolean) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  onSearch,
  onResultSelect,
  placeholder = "Search by name, location, or owner..."
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10&suggest=true`);
        const data = await response.json();

        if (data.results) {
          setSuggestions(data.results);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    console.log('[AUTOCOMPLETE] Query changed to:', newQuery);
    setQuery(newQuery);
    setSelectedIndex(-1);

    // Call onSearch for filtering as user types (isSubmit=false)
    if (onSearch && newQuery.length >= 2) {
      onSearch(newQuery, false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AUTOCOMPLETE] Form submitted with query:', query);
    if (query.trim()) {
      setShowSuggestions(false);
      // Call onSearch with isSubmit=true for full database search
      onSearch(query, true);
    }
  };

  const handleSuggestionClick = (result: SearchResult) => {
    setQuery(result._identifier);
    setShowSuggestions(false);
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      onSearch(result._identifier);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!text) return '';
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-semibold text-brand-green">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
          <Input
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-6 text-lg rounded-full border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:bg-white focus:border-brand-tan relative z-10"
          />
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-brand-green pointer-events-none z-20" />
          )}
        </div>
      </form>

      {/* Autocomplete Suggestions - Names Only */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[99999] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((result, index) => (
            <div
              key={`${result._table}-${result.id || index}`}
              onClick={() => handleSuggestionClick(result)}
              className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-gray-50' : ''
              }`}
            >
              <div className="font-medium text-sm text-gray-900 truncate">
                {highlightMatch(result._identifier, query)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-[99999] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
};
