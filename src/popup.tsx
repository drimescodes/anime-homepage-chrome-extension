import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { fetchAnimeImage } from './utils/imageUtils';
import './popup.css';

const categories = {
  sfw: ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile'],
  nsfw: ['waifu', 'neko', 'trap', 'blowjob']
};


const Popup = () => {
  const [selectedTag, setSelectedTag] = useState<'sfw' | 'nsfw'>('sfw');
  const [loading, setLoading] = useState(false);

  const changeBackground = async (category: string) => {
    setLoading(true);
    try {
      const newImage = await fetchAnimeImage(selectedTag, category);
      await chrome.storage.local.set({ backgroundImage: newImage });
      
      const tabs = await chrome.tabs.query({ url: 'chrome://newtab/*' });
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'CHANGE_BACKGROUND',
            image: newImage
          });
        }
      });
    } catch (error) {
      console.error('Error changing background:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container">
      <div className="tag-toggle">
        <button
          className={`tag-button ${selectedTag === 'sfw' ? 'active' : ''}`}
          onClick={() => setSelectedTag('sfw')}
        >
          SFW
        </button>
        <button
          className={`tag-button ${selectedTag === 'nsfw' ? 'active' : ''}`}
          onClick={() => setSelectedTag('nsfw')}
        >
          NSFW  ⚠️
        </button>
      </div>

      <div className="category-grid">
        {categories[selectedTag].map((category) => (
          <button
            key={category}
            className="category-button"
            onClick={() => changeBackground(category)}
            disabled={loading}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading new image...</div>}
    </div>
  );
};


const root = document.getElementById('popup-root');
if (root) {
  createRoot(root).render(<Popup />);
}