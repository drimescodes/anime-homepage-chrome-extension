import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { fetchAnimeImage } from './utils/imageUtils';
import './popup.css';

const categories = {
  sfw: {
    'Images': ['waifu', 'neko', 'kitsune', 'husbando', 'maid', 'uniform', 'selfies'],
    'Reactions': ['hug', 'pat', 'kiss', 'cuddle', 'smile', 'blush', 'smug', 'wave', 'wink', 'dance', 'happy', 'laugh', 'cry', 'bonk', 'yeet', 'slap', 'poke'],
  },
  nsfw: {
    'Images': ['waifu', 'ero', 'ecchi', 'hentai', 'oppai'],
  },
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

  const currentCategories = categories[selectedTag];

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

      {Object.entries(currentCategories).map(([groupName, items]) => (
        <div key={groupName} className="category-group">
          <div className="category-group-label">{groupName}</div>
          <div className="category-grid">
            {items.map((category) => (
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
        </div>
      ))}

      {loading && <div className="loading">Loading new image...</div>}
    </div>
  );
};


const root = document.getElementById('popup-root');
if (root) {
  createRoot(root).render(<Popup />);
}