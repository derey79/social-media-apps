'use client';

import { Home, Compass } from 'lucide-react';

interface FeedTabsProps {
  activeTab: 'feed' | 'explore';
  setActiveTab: (tab: 'feed' | 'explore') => void;
  isVisible: boolean;
}

export default function FeedTabs({
  activeTab,
  setActiveTab,
  isVisible,
}: FeedTabsProps) {
  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-24'
      }`}
    >
      <div className='flex items-center bg-black/80 backdrop-blur-md border border-[#181D27] p-1 rounded-full shadow-lg'>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-neutral-400/85 text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className='h-3.5 w-3.5' />
          <span>Feed</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-neutral-400/85 text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Compass className='h-3.5 w-3.5' />
          <span>Explore</span>
        </button>
      </div>
    </div>
  );
}
