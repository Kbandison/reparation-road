import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Passports Issued by Governors of Georgia 1785-1809
            </h1>
            <p className="text-lg text-white/90">
              Early travel documentation and passports issued by Georgia governors.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-600 mb-6">
            This collection is currently being digitized and will be available soon.
          </p>
          <p className="text-sm text-gray-500">
            Check back regularly for updates as we continue to expand our historical archives.
          </p>
        </div>
      </div>
    </div>
  );
}
