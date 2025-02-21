import { useState, useEffect } from 'react';

const AdaptiveBackground = ({ imageUrl }: { imageUrl: string }) => {
    const [imageProperties, setImageProperties] = useState({
    width: 0,
    height: 0,
    aspectRatio: 0
  });

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      setImageProperties({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
  }, [imageUrl]);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40" 
        style={{ zIndex: -2 }}
      />
      <div
        className="fixed inset-0 transition-opacity duration-300"
        style={{
          zIndex: -1,
          backgroundColor: 'black',
          opacity: imageProperties.width ? 1 : 0
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            filter: 'blur(8px) brightness(0.8)',
            transform: 'scale(1.1)'
          }}
        >
          <img
            src={imageUrl}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="main background"
            className={`max-w-[95vw] max-h-[95vh] ${
              imageProperties.aspectRatio > 2 ? 'w-full' : 
              imageProperties.aspectRatio < 0.5 ? 'h-full' : 
              'object-contain'
            }`}
            style={{
              objectFit: 'contain',
              boxShadow: '0 4px 60px rgba(0, 0, 0, 0.5)'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default AdaptiveBackground;