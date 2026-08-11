// ----------------------------------------------------------------------
// Google Fonts & System Fonts Registry
// Dynamically loads Google Web Fonts into document head & email HTML
// ----------------------------------------------------------------------

export const FONT_CATALOG = [
  // ONBOARDING & SYSTEM FONTS
  { name: 'Google Sans (Default)', family: '"Google Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif', type: 'system' },
  { name: 'Inter', family: 'Inter, system-ui, sans-serif', type: 'system' },
  { name: 'Arial / Helvetica', family: 'Arial, Helvetica, sans-serif', type: 'system' },
  { name: 'Georgia (Serif)', family: 'Georgia, serif', type: 'system' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif', type: 'system' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', type: 'system' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif', type: 'system' },
  { name: 'Courier New (Mono)', family: '"Courier New", Courier, monospace', type: 'system' },
  
  // GOOGLE WEB FONTS
  { name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap' },
  { name: 'Roboto', family: '"Roboto", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap' },
  { name: 'Poppins', family: '"Poppins", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap' },
  { name: 'Lora', family: '"Lora", serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,700;1,500&display=swap' },
  { name: 'Space Grotesk', family: '"Space Grotesk", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap' },
  { name: 'Outfit', family: '"Outfit", sans-serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap' },
  { name: 'Cinzel (Luxury)', family: '"Cinzel", serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&display=swap' },
  { name: 'Cormorant Garamond', family: '"Cormorant Garamond", serif', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap' },
  { name: 'Fira Code (Code)', family: '"Fira Code", monospace', type: 'google', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@500;700&display=swap' }
];

// Dynamically inject all Google Fonts stylesheets into document DOM head
export function loadGoogleFontsInDOM() {
  FONT_CATALOG.forEach(font => {
    if (font.type === 'google' && font.url) {
      const id = `google-font-${font.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
      }
    }
  });
}

// Generate Google Fonts HTML stylesheet import tags for email export
export function getGoogleFontsExportHtml() {
  return FONT_CATALOG
    .filter(f => f.type === 'google' && f.url)
    .map(f => `<link href="${f.url}" rel="stylesheet">`)
    .join('\n  ');
}
