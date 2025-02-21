import axios from 'axios';

export async function fetchAnimeImage(type: 'sfw' | 'nsfw', category: string): Promise<string> {
  try {
    const response = await axios.get(`https://api.waifu.pics/${type}/${category}`);
    return response.data.url;
  } catch (error) {
    console.error('Error fetching anime images:', error);
    throw error;
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