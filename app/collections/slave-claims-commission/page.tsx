import Link from 'next/link';
import { Scale, ScrollText, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const subcollections = [
  {
    name: 'Register of Free Persons of Color, Jefferson',
    href: '/collections/slave-claims-commission/register-free-persons-jefferson',
    description: 'Historical records documenting free persons of color in Jefferson County, Georgia.',
    icon: ScrollText
  }
];

export default function Page() {
  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Scale className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Georgia State Records Concerning Persons of Color
            </h1>
            <p className="text-lg text-white/90">
              State records documenting persons of color in Georgia.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-brand-brown mb-6">Available Subcollections</h2>

          <div className="grid gap-4">
            {subcollections.map((subcollection) => {
              const Icon = subcollection.icon;
              return (
                <Link
                  key={subcollection.href}
                  href={subcollection.href}
                  className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-brand-green/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
                      <Icon className="w-6 h-6 text-brand-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-brown group-hover:text-brand-green transition-colors">
                        {subcollection.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {subcollection.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-brand-tan/30 rounded-xl">
            <p className="text-gray-600 text-center">
              More subcollections are being digitized and will be available soon.
              Check back regularly for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
