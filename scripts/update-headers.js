const fs = require('fs');
const path = require('path');

const modernHeaderTemplate = (icon, title, description) => `import { ${icon} } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <${icon} className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ${title}
            </h1>
            <p className="text-lg text-white/90">
              ${description}
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
`;

const pages = [
  // Florida/Louisiana
  { path: 'app/collections/florida-louisiana/colored-baptisms-1784-1793/page.tsx', icon: 'Users', title: 'Colored Baptisms (1784-1793)', description: 'Baptism records of people of color in Florida and Louisiana from 1784 to 1793.' },
  { path: 'app/collections/florida-louisiana/colored-baptisms-1807-1848/page.tsx', icon: 'Users', title: 'Colored Baptisms (1807-1848)', description: 'Baptism records of people of color in Florida and Louisiana from 1807 to 1848.' },
  { path: 'app/collections/florida-louisiana/colored-deaths-1785-1821/page.tsx', icon: 'FileText', title: 'Colored Deaths (1785-1821)', description: 'Death records of people of color in Florida and Louisiana from 1785 to 1821.' },
  { path: 'app/collections/florida-louisiana/colored-marriages-1784-1882/page.tsx', icon: 'Heart', title: 'Colored Marriages (1784-1882)', description: 'Marriage records of people of color in Florida and Louisiana from 1784 to 1882.' },
  { path: 'app/collections/florida-louisiana/mixed-baptisms-1793-1807/page.tsx', icon: 'Users', title: 'Mixed Baptisms (1793-1807)', description: 'Baptism records from mixed congregations in Florida and Louisiana from 1793 to 1807.' },

  // Ex-Slave Pension Correspondence
  { path: 'app/collections/ex-slave-pension/national-ex-slave-relief/page.tsx', icon: 'FileText', title: 'National Ex-Slave Mutual Relief, Bounty and Pension Association', description: 'Records of the National Ex-Slave Mutual Relief, Bounty and Pension Association and related organizations.' },
  { path: 'app/collections/ex-slave-pension/correspondence-1892-1898/page.tsx', icon: 'Mail', title: 'Correspondence (1892-1898)', description: 'Letters and correspondence related to ex-slave pension claims from 1892 to 1898.' },
  { path: 'app/collections/ex-slave-pension/correspondence-1899-1904/page.tsx', icon: 'Mail', title: 'Correspondence (1899-1904)', description: 'Letters and correspondence related to ex-slave pension claims from 1899 to 1904.' },
  { path: 'app/collections/ex-slave-pension/correspondence-1905-1909/page.tsx', icon: 'Mail', title: 'Correspondence (1905-1909)', description: 'Letters and correspondence related to ex-slave pension claims from 1905 to 1909.' },
  { path: 'app/collections/ex-slave-pension/correspondence-1910-1917/page.tsx', icon: 'Mail', title: 'Correspondence (1910-1917)', description: 'Letters and correspondence related to ex-slave pension claims from 1910 to 1917.' },
  { path: 'app/collections/ex-slave-pension/correspondence-1918-1922/page.tsx', icon: 'Mail', title: 'Correspondence (1918-1922)', description: 'Letters and correspondence related to ex-slave pension claims from 1918 to 1922.' },

  // Virginia Property Tithes
  { path: 'app/collections/virginia-property-tithes/chesterfield-county-1747-1821/page.tsx', icon: 'ScrollText', title: 'Chesterfield County (1747-1821)', description: 'Personal property and tithe records from Chesterfield County, Virginia, 1747-1821.' },
  { path: 'app/collections/virginia-property-tithes/franklin-county/page.tsx', icon: 'ScrollText', title: 'Franklin County', description: 'Personal property and tithe records from Franklin County, Virginia.' },
  { path: 'app/collections/virginia-property-tithes/hanover-county-1782-1786/page.tsx', icon: 'ScrollText', title: 'Hanover County (1782-1786)', description: 'Personal property and tithe records from Hanover County, Virginia, 1782-1786.' },
  { path: 'app/collections/virginia-property-tithes/lancaster-county/page.tsx', icon: 'ScrollText', title: 'Lancaster County', description: 'Personal property and tithe records from Lancaster County, Virginia.' },
  { path: 'app/collections/virginia-property-tithes/richmond/page.tsx', icon: 'ScrollText', title: 'Richmond', description: 'Personal property and tithe records from Richmond, Virginia.' },

  // Standalone Collections
  { path: 'app/collections/bills-of-exchange/page.tsx', icon: 'FileText', title: 'English Bills of Exchange', description: 'Financial transaction records and bills of exchange documenting economic activities.' },
  { path: 'app/collections/clubs-organizations/page.tsx', icon: 'Users', title: 'Clubs and Organizations', description: 'Records from fraternal societies, social clubs, and community organizations.' },
  { path: 'app/collections/confederate-payrolls/page.tsx', icon: 'ScrollText', title: 'Maryland State Records Concerning Persons of Color', description: 'State records documenting persons of color in Maryland.' },
  { path: 'app/collections/east-indians-native-americans/page.tsx', icon: 'Users', title: 'East Indians and Native Americans in MD & VA', description: 'Documentation of mixed heritage communities in Maryland and Virginia.' },
  { path: 'app/collections/freedmen-refugee-contraband/page.tsx', icon: 'FileText', title: 'Freedmen, Refugee and Contraband Records', description: 'Freedmen\'s Bureau documentation and records of refugees and contraband.' },
  { path: 'app/collections/fugitive-slave-cases/page.tsx', icon: 'Scale', title: 'Fugitive and Slave Case Files', description: 'Legal cases, court records, and documentation related to fugitive slave cases.' },
  { path: 'app/collections/georgia-passports/page.tsx', icon: 'FileText', title: 'Passports Issued by Governors of Georgia 1785-1809', description: 'Early travel documentation and passports issued by Georgia governors.' },
  { path: 'app/collections/mississippi-registers/page.tsx', icon: 'BookOpen', title: 'Kentucky State Records Concerning Persons of Color', description: 'State records documenting persons of color in Kentucky.' },
  { path: 'app/collections/new-rules/page.tsx', icon: 'FileText', title: 'New Rules Collection', description: 'Historical records and documentation collection.' },
  { path: 'app/collections/rac-vlc/page.tsx', icon: 'Ship', title: 'Records of the RAC and VOC', description: 'Royal African Company and Dutch VOC trading records and documentation.' },
  { path: 'app/collections/slave-claims-commission/page.tsx', icon: 'Scale', title: 'Records of Slave Claims Commission', description: 'British compensation records and claims commission documentation.' },
  { path: 'app/collections/slave-importation/page.tsx', icon: 'Ship', title: 'Slave Importation Declaration', description: 'Ships and cargo manifests documenting slave trade voyages and imports.' },
  { path: 'app/collections/slave-narratives/page.tsx', icon: 'BookOpen', title: 'Slave Narratives', description: 'First-hand accounts and narratives of enslavement from formerly enslaved individuals.' },
  { path: 'app/collections/southwest-georgia/page.tsx', icon: 'FileText', title: 'Southwest Georgia Obits and Burials', description: 'Death records, obituaries, and cemetery documentation from Southwest Georgia.' },
  { path: 'app/collections/tennessee-registers/page.tsx', icon: 'BookOpen', title: 'Tennessee State Records Concerning Persons of Color', description: 'State records documenting persons of color in Tennessee.' },
  { path: 'app/collections/virginia-order-books/page.tsx', icon: 'Scale', title: 'Virginia Order Books: Negro Adjudgments', description: 'Court proceedings, legal judgments, and order books from Virginia courts.' },
];

let updatedCount = 0;
let errorCount = 0;

pages.forEach(page => {
  const fullPath = path.join(__dirname, '..', page.path);

  try {
    const content = modernHeaderTemplate(page.icon, page.title, page.description);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated: ${page.path}`);
    updatedCount++;
  } catch (error) {
    console.error(`✗ Error updating ${page.path}:`, error.message);
    errorCount++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`Updated: ${updatedCount} pages`);
console.log(`Errors: ${errorCount} pages`);
