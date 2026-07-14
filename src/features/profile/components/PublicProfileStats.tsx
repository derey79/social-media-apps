'use client';

import { useState } from 'react';
import FollowModal from './FollowModal';
import { PublicProfileStatsProps } from '@/types/types';

export default function PublicProfileStats({
  stats,
  isClient,
  username,
  isMyProfile = false,
}: PublicProfileStatsProps) {
  const [activeModalType, setActiveModalType] = useState<
    'followers' | 'following' | null
  >(null);
  return (
    <>
      <div className='grid grid-cols-4 gap-2 sm:gap-4 w-full select-none'>
        {/* Kotak Posts */}
        <div className='bg-[#0B0F17]/60 border border-[#181D27] rounded-2xl p-3 sm:p-4 text-center'>
          <p className='text-base sm:text-xl font-extrabold text-white tracking-tight'>
            {isClient ? stats.posts : '0'}
          </p>
          <p className='text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5'>
            Posts
          </p>
        </div>

        {/* 💡 Kotak Followers (Bisa Diklik Reaktif) */}
        <div
          onClick={() =>
            isClient && stats.followers > 0 && setActiveModalType('followers')
          }
          className={`bg-[#0B0F17]/60 border border-[#181D27] rounded-2xl p-3 sm:p-4 text-center transition-all ${
            isClient && stats.followers > 0
              ? 'hover:border-neutral-700 hover:bg-neutral-900/30 cursor-pointer active:scale-95'
              : ''
          }`}
        >
          <p className='text-base sm:text-xl font-extrabold text-white tracking-tight'>
            {isClient ? stats.followers : '0'}
          </p>
          <p className='text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5'>
            Followers
          </p>
        </div>

        {/* 💡 Kotak Following (Bisa Diklik Reaktif) */}
        <div
          onClick={() =>
            isClient && stats.following > 0 && setActiveModalType('following')
          }
          className={`bg-[#0B0F17]/60 border border-[#181D27] rounded-2xl p-3 sm:p-4 text-center transition-all ${
            isClient && stats.following > 0
              ? 'hover:border-neutral-700 hover:bg-neutral-900/30 cursor-pointer active:scale-95'
              : ''
          }`}
        >
          <p className='text-base sm:text-xl font-extrabold text-white tracking-tight'>
            {isClient ? stats.following : '0'}
          </p>
          <p className='text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5'>
            Following
          </p>
        </div>

        {/* Kotak Likes */}
        <div className='bg-[#0B0F17]/60 border border-[#181D27] rounded-2xl p-3 sm:p-4 text-center'>
          <p className='text-base sm:text-xl font-extrabold text-white tracking-tight'>
            {isClient ? stats.likes : '0'}
          </p>
          <p className='text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5'>
            Likes
          </p>
        </div>
      </div>

      {activeModalType !== null && (
        <FollowModal
          username={username}
          type={activeModalType}
          onClose={() => setActiveModalType(null)}
          isMyProfile={isMyProfile}
        />
      )}
    </>
  );
}
