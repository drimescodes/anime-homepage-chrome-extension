import axios from 'axios';

// API provider types
type ApiProvider = 'waifu.im' | 'nekos.best';

interface CategoryMapping {
  provider: ApiProvider;
  endpoint: string; // The actual API category/tag name
}

// Maps our internal category names to the correct API provider + endpoint
const SFW_CATEGORY_MAP: Record<string, CategoryMapping> = {
  // Static image categories → waifu.im
  waifu:   { provider: 'waifu.im', endpoint: 'waifu' },
  maid:    { provider: 'waifu.im', endpoint: 'maid' },
  uniform: { provider: 'waifu.im', endpoint: 'uniform' },
  selfies: { provider: 'waifu.im', endpoint: 'selfies' },
  // Static image categories → nekos.best
  neko:     { provider: 'nekos.best', endpoint: 'neko' },
  kitsune:  { provider: 'nekos.best', endpoint: 'kitsune' },
  husbando: { provider: 'nekos.best', endpoint: 'husbando' },
  // GIF/reaction categories → nekos.best
  cuddle: { provider: 'nekos.best', endpoint: 'cuddle' },
  cry:    { provider: 'nekos.best', endpoint: 'cry' },
  hug:    { provider: 'nekos.best', endpoint: 'hug' },
  kiss:   { provider: 'nekos.best', endpoint: 'kiss' },
  pat:    { provider: 'nekos.best', endpoint: 'pat' },
  smug:   { provider: 'nekos.best', endpoint: 'smug' },
  bonk:   { provider: 'nekos.best', endpoint: 'bonk' },
  yeet:   { provider: 'nekos.best', endpoint: 'yeet' },
  blush:  { provider: 'nekos.best', endpoint: 'blush' },
  smile:  { provider: 'nekos.best', endpoint: 'smile' },
  wave:   { provider: 'nekos.best', endpoint: 'wave' },
  dance:  { provider: 'nekos.best', endpoint: 'dance' },
  happy:  { provider: 'nekos.best', endpoint: 'happy' },
  laugh:  { provider: 'nekos.best', endpoint: 'laugh' },
  poke:   { provider: 'nekos.best', endpoint: 'poke' },
  slap:   { provider: 'nekos.best', endpoint: 'slap' },
  wink:   { provider: 'nekos.best', endpoint: 'wink' },
};

const NSFW_CATEGORY_MAP: Record<string, CategoryMapping> = {
  waifu:   { provider: 'waifu.im', endpoint: 'waifu' },
  ero:     { provider: 'waifu.im', endpoint: 'ero' },
  ecchi:   { provider: 'waifu.im', endpoint: 'ecchi' },
  hentai:  { provider: 'waifu.im', endpoint: 'hentai' },
  oppai:   { provider: 'waifu.im', endpoint: 'oppai' },
};

// Fetch from waifu.im
async function fetchFromWaifuIm(tag: string, isNsfw: boolean): Promise<string> {
  const params = new URLSearchParams({ IncludedTags: tag });
  if (isNsfw) params.append('IsNsfw', 'True');
  const response = await axios.get(`https://api.waifu.im/images?${params}`);
  return response.data.items[0].url;
}

// Fetch from nekos.best
async function fetchFromNekosBest(category: string): Promise<string> {
  const response = await axios.get(`https://nekos.best/api/v2/${category}`);
  return response.data.results[0].url;
}

// Fallback: try waifu.im waifu tag as a last resort
async function fetchFallback(isNsfw: boolean): Promise<string> {
  try {
    return await fetchFromWaifuIm('waifu', isNsfw);
  } catch {
    // If waifu.im also fails, try nekos.best waifu (SFW only)
    return await fetchFromNekosBest('waifu');
  }
}

export async function fetchAnimeImage(type: 'sfw' | 'nsfw', category: string): Promise<string> {
  const isNsfw = type === 'nsfw';
  const categoryMap = isNsfw ? NSFW_CATEGORY_MAP : SFW_CATEGORY_MAP;
  const mapping = categoryMap[category];

  if (!mapping) {
    console.warn(`Unknown category "${category}", falling back to default`);
    return fetchFallback(isNsfw);
  }

  try {
    if (mapping.provider === 'waifu.im') {
      return await fetchFromWaifuIm(mapping.endpoint, isNsfw);
    } else {
      return await fetchFromNekosBest(mapping.endpoint);
    }
  } catch (error) {
    console.error(`Error fetching from ${mapping.provider}:`, error);
    // Try fallback on failure
    try {
      return await fetchFallback(isNsfw);
    } catch (fallbackError) {
      console.error('All API providers failed:', fallbackError);
      throw fallbackError;
    }
  }
}


export async function setBackgroundImage(imageUrl: string) {
  await chrome.storage.local.set({ backgroundImage: imageUrl });
  
  // Notify all tabs about the new background
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CHANGE_BACKGROUND',
        image: imageUrl
      });
    }
  });
}