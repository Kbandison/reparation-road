import { FileText } from 'lucide-react';

export default function EarlyCherkeeCensusPage() {
  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Early Cherokee Census</h1>
            <p className="text-lg text-white/90">
              Early census records of Cherokee Nation members documenting the population before and during the removal period. These records help trace Cherokee family lines and include individuals of African descent within the nation.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm breadcrumbs mb-6">
          <ol className="flex items-center space-x-2 text-brand-brown">
            <li>
              <a href="/collections/native-american-records" className="hover:underline">
                Native American Records
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="font-semibold">Early Cherokee Census</li>
          </ol>
        </nav>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            Records are being prepared for display. Please check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
