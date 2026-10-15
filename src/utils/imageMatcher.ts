export interface ImagePreset {
  id: string;
  name: string;
  nameTe: string;
  keywords: string[];
  url: string;
}

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'turmeric',
    name: 'Turmeric Powder (పసుపు)',
    nameTe: 'పసుపు పొడి',
    keywords: ['turmeric', 'turmaric', 'turmarick', 'pasupu', 'pasapu', 'pasup', 'haldi', 'పసుపు'],
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80',
  },
  {
    id: 'soap',
    name: 'Soap / Mysore Sandal (సబ్బు)',
    nameTe: 'సబ్బు / బాత్ సోప్',
    keywords: ['soap', 'sandal', 'sandle', 'sander', 'mysore', 'lux', 'santoor', 'cinthol', 'dove', 'detergent', 'surf', 'rin', 'సబ్బు', 'సోప్'],
    url: 'https://images.unsplash.com/photo-1607006482602-765180037159?w=500&q=80',
  },
  {
    id: 'oil_sunflower',
    name: 'Sunflower Oil (సన్‌ఫ్లవర్ నూనె)',
    nameTe: 'సన్‌ఫ్లవర్ నూనె',
    keywords: ['sunflower', 'sun flower', 'freedom', 'gold winner', 'fortune', 'oil', 'refined', 'నూనె', 'సన్‌ఫ్లవర్'],
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80',
  },
  {
    id: 'oil_groundnut',
    name: 'Groundnut Oil (పల్లీ నూనె)',
    nameTe: 'పల్లీ నూనె',
    keywords: ['groundnut', 'ground nut', 'peanut', 'palli', 'పల్లీ', 'వేరుశనగ'],
    url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&q=80',
  },
  {
    id: 'rice',
    name: 'Rice Grains (బియ్యం)',
    nameTe: 'బియ్యం',
    keywords: ['rice', 'ryce', 'sona', 'masoori', 'basmati', 'ndl', 'biyyam', 'biyam', 'బియ్యం', 'అన్నం'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
  },
  {
    id: 'toor_dal',
    name: 'Toor Dal / Pulses (కందిపప్పు)',
    nameTe: 'కందిపప్పు',
    keywords: ['toor', 'tur', 'dal', 'dhal', 'pigeon', 'kandi', 'pappu', 'కందిపప్పు', 'పప్పు'],
    url: 'https://images.unsplash.com/photo-1585994191611-72d388e843ef?w=500&q=80',
  },
  {
    id: 'chili',
    name: 'Red Chili Powder (కారప్పొడి)',
    nameTe: 'కారప్పొడి',
    keywords: ['chili', 'chilli', 'chilly', 'chilli powder', 'karam', 'guntur', 'mirchi', 'కారప్పొడి', 'మిర్చి', 'కారం'],
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80',
  },
  {
    id: 'pickle',
    name: 'Mango Avakaya Pickle (ఆవకాయ)',
    nameTe: 'మామిడి ఆవకాయ',
    keywords: ['pickle', 'pikle', 'avakaya', 'avakaia', 'mango', 'gongura', 'pachadi', 'పచ్చడి', 'ఆవకాయ', 'మామిడి'],
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80',
  },
  {
    id: 'ghee',
    name: 'Desi Cow Ghee (నెయ్యి)',
    nameTe: 'ఆవు నెయ్యి',
    keywords: ['ghee', 'ghe', 'cow ghee', 'neyyi', 'neyi', 'నెయ్యి', 'నేయి'],
    url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&q=80',
  },
  {
    id: 'camphor',
    name: 'Camphor & Pooja Items (కర్పూరం)',
    nameTe: 'కర్పూరం / పూజ సామగ్రి',
    keywords: ['camphor', 'camphor', 'pooja', 'puja', 'karpooram', 'batti', 'కర్పూరం', 'పూజ'],
    url: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=500&q=80',
  },
  {
    id: 'atta_flour',
    name: 'Wheat Atta / Flour (పిండి)',
    nameTe: 'గోధుమ పిండి',
    keywords: ['atta', 'flour', 'wheat', 'godhuma', 'pindi', 'పిండి', 'గోధుమ'],
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
  },
  {
    id: 'tea_coffee',
    name: 'Tea / Coffee Powder (టీ / కాఫీ)',
    nameTe: 'టీ పొడి / కాఫీ',
    keywords: ['tea', 'coffee', 'chai', 'taj', 'red label', '3 roses', 'టీ', 'కాఫీ'],
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
  },
  {
    id: 'general_grocery',
    name: 'Kirana Grocery Store',
    nameTe: 'కిరాణా సరుకు',
    keywords: ['grocery', 'kirana', 'item', 'packet', 'box', 'సరుకు'],
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
  },
];

// Fuzzy Smart Image Matcher that supports typos, misspelling & Telugu phonetics
export function autoSelectProductImage(productName: string): string {
  if (!productName || !productName.trim()) {
    return IMAGE_PRESETS[IMAGE_PRESETS.length - 1].url;
  }

  const query = productName.toLowerCase().trim();

  // 1. Direct Keyword Matching
  for (const preset of IMAGE_PRESETS) {
    for (const kw of preset.keywords) {
      if (query.includes(kw.toLowerCase())) {
        return preset.url;
      }
    }
  }

  // 2. Fuzzy Token Matching for typos like "Turmaric", "Ryce", "Ghe"
  const tokens = query.split(/\s+/);
  for (const token of tokens) {
    if (token.length < 3) continue;
    for (const preset of IMAGE_PRESETS) {
      for (const kw of preset.keywords) {
        if (kw.toLowerCase().startsWith(token) || token.startsWith(kw.toLowerCase().slice(0, 4))) {
          return preset.url;
        }
      }
    }
  }

  return IMAGE_PRESETS[IMAGE_PRESETS.length - 1].url;
}
