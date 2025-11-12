const fs = require('fs');
const path = require('path');

const modernHeaderTemplate = (state) => {
  const stateTitle = state.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return `import { Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ${state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lost Friends: ${stateTitle}
            </h1>
            <p className="text-lg text-white/90">
              Post-war family reunion advertisements from ${stateTitle}, documenting formerly enslaved individuals searching for separated loved ones.
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
};

const lostFriendsDir = path.join(__dirname, '..', 'app', 'collections', 'lost-friends');

let updatedCount = 0;
let errorCount = 0;

try {
  const states = fs.readdirSync(lostFriendsDir)
    .filter(item => {
      const itemPath = path.join(lostFriendsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

  console.log(`Found ${states.length} state directories\n`);

  states.forEach(state => {
    const pagePath = path.join(lostFriendsDir, state, 'page.tsx');

    try {
      const content = modernHeaderTemplate(state);
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log(`✓ Updated: lost-friends/${state}/page.tsx`);
      updatedCount++;
    } catch (error) {
      console.error(`✗ Error updating lost-friends/${state}/page.tsx:`, error.message);
      errorCount++;
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updatedCount} pages`);
  console.log(`Errors: ${errorCount} pages`);
} catch (error) {
  console.error('Error reading lost-friends directory:', error.message);
}
