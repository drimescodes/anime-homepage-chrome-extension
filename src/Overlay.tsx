import { useState, useEffect } from 'react';
import search from './assets/search.png'

const NewTabPage = () => {
  const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    chrome.topSites?.get((sites: chrome.topSites.MostVisitedURL[]) => {
      setTopSites(sites?.slice(0, 8) || []);
    });
  }, []);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      // Using Google's favicon service as a reliable source
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      chrome.search.query({
        text: searchQuery,
        disposition: 'CURRENT_TAB'
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full pt-20 px-4">
      <form 
        onSubmit={handleSearch}
        className="w-full max-w-2xl mb-12"
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or type a URL"
            className="w-full px-6 py-4 bg-black/20 backdrop-blur-md rounded-full 
                     text-white placeholder-gray-300 outline-none border-2 
                     border-white/10 hover:border-white/20 focus:border-white/30
                     transition-all duration-200"
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2
                     hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <img src={search} alt="search button" className='h-6 w-6'/>

          </button>
        </div>
      </form>

      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topSites.map((site, index) => {
            const faviconUrl = getFaviconUrl(site.url);
            
            return (
              <a
                key={index}
                href={site.url}
                className="group flex flex-col items-center p-4 rounded-xl
                         bg-black/20 backdrop-blur-md border-2 border-white/10
                         hover:border-white/20 transition-all duration-200"
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-white/10 flex 
                              items-center justify-center overflow-hidden">
                  {faviconUrl ? (
                    <img 
                      src={faviconUrl}
                      alt={`${site.title} favicon`}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        // Fallback to first letter if favicon fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = site.title[0].toUpperCase();
                      }}
                    />
                  ) : (
                    <span className="text-xl font-medium text-white uppercase">
                      {site.title[0]}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/70 text-center 
                               group-hover:text-white transition-colors duration-200
                               truncate w-full">
                  {site.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewTabPage;