import { useEffect, useState } from 'react';
import { fetchAnimeImage } from './utils/imageUtils';
import NewTabPage from './Overlay';
import './App.css';

const App = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
const initializeBackground = async () => {
  const result = await chrome.storage.local.get(['backgroundImage']);
  
  if (result.backgroundImage) {
    setBackgroundImage(result.backgroundImage);
  } else {
    try {
      const newImage = await fetchAnimeImage('sfw', 'waifu');
      setBackgroundImage(newImage);
      await chrome.storage.local.set({ backgroundImage: newImage });
    } catch (error) {
      console.error('Error setting initial background:', error);
    }
  }
};

    const messageListener = (message: any) => {
      if (message.type === 'CHANGE_BACKGROUND') {
        setBackgroundImage(message.image);
      }
    };

    initializeBackground();
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div className="app-container">
      {backgroundImage && (
        <div
          className="background-image"
          style={{
            backgroundImage: `url(${backgroundImage})`
          }}
        />
      )}
      <NewTabPage />
    </div>
  );
};

export default App;