'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Bookmark, Loader2 } from 'lucide-react';
import Image from 'next/image';
import ImageModal from '@/features/feed/components/ImageModal';
import { PostItem } from '@/types/types';
import { SavedApiResponse } from '@/types/types';
import { ProfileTabsProps } from '@/types/types';

export default function ProfileTabs({
  username,
  isMyProfile,
  initialPosts,
}: ProfileTabsProps) {
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  const savedEndpoint = isMyProfile ? '/me/saved' : `/users/${username}/saved`;

  const { data: savedResponse, isLoading: isSavedLoading } =
    useQuery<SavedApiResponse>({
      queryKey: [
        'posts',
        isMyProfile ? 'my-saved-list' : `public-saved-list-${username}`,
      ],
      queryFn: async () => {
        const res = await axiosInstance.get(`${savedEndpoint}?page=1&limit=50`);
        return res.data;
      },
      enabled: !!username,
    });

  const savedPosts = savedResponse?.data?.posts || [];

  return (
    <>
      <Tabs defaultValue='stories' className='w-full'>
        <TabsList className='w-full justify-start bg-transparent border-b border-[#181D27] rounded-none p-0 h-auto gap-8'>
          {/* Tab 1: Stories */}
          <TabsTrigger
            value='stories'
            className='data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none bg-transparent p-0 pb-3 text-sm font-semibold text-neutral-400 border-b-2 border-transparent transition-all flex items-center gap-2 cursor-pointer select-none'
          >
            <Grid3X3 className='h-4 w-4' />
            <span>
              {isMyProfile ? 'My Stories' : 'Stories'} ({initialPosts.length})
            </span>
          </TabsTrigger>

          {/* Tab 2: Saved */}
          {(isMyProfile || savedPosts.length > 0) && (
            <TabsTrigger
              value='saved'
              className='data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none bg-transparent p-0 pb-3 text-sm font-semibold text-neutral-400 border-b-2 border-transparent transition-all flex items-center gap-2 cursor-pointer select-none'
            >
              <Bookmark className='h-4 w-4' />
              <span>Saved ({savedPosts.length})</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value='stories'
          className='pt-6 focus-visible:outline-none'
        >
          {initialPosts.length === 0 ? (
            <p className='text-sm text-neutral-400 tracking-wide font-medium text-center py-12'>
              No stories published yet. 🚀
            </p>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300'>
              {initialPosts.map((postItem: PostItem) => (
                <div
                  key={postItem.id}
                  onClick={() => setSelectedPost(postItem)}
                  className='group relative aspect-square bg-[#0B0F17] border border-[#181D27] rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-zoom-in'
                >
                  {postItem.imageUrl ? (
                    <Image
                      src={postItem.imageUrl}
                      alt={postItem.caption || 'Story content'}
                      fill
                      sizes='(max-w-xs) 50vw, 250px'
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                  ) : (
                    <div className='w-full h-full p-3 flex flex-col justify-between text-left'>
                      <p className='text-xs text-neutral-400 font-normal line-clamp-4 leading-relaxed'>
                        {postItem.caption}
                      </p>
                      <span className='text-[10px] text-neutral-600 font-semibold uppercase tracking-wider'>
                        Text Only
                      </span>
                    </div>
                  )}

                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-left'>
                    <p className='text-xs text-white font-medium line-clamp-2 leading-snug'>
                      {postItem.caption || 'View Story'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='saved' className='pt-6 focus-visible:outline-none'>
          {isSavedLoading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-2 text-neutral-400'>
              <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
              <span className='text-xs'>Streaming archive collection...</span>
            </div>
          ) : savedPosts.length === 0 ? (
            <p className='text-sm text-neutral-400 tracking-wide font-medium text-center py-12'>
              No saved posts found in the archive. 📑
            </p>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300'>
              {savedPosts.map((savedPost: PostItem) => (
                <div
                  key={savedPost.id}
                  onClick={() =>
                    setSelectedPost({
                      ...savedPost,
                      author: savedPost.author || {
                        id: 0,
                        username: 'unknown',
                        name: 'Sociality User',
                        avatarUrl: null,
                      },
                    })
                  }
                  className='group relative aspect-square bg-[#0B0F17] border border-[#181D27] rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-zoom-in'
                >
                  {savedPost.imageUrl ? (
                    <Image
                      src={savedPost.imageUrl}
                      alt={savedPost.caption || 'Saved content'}
                      fill
                      sizes='(max-w-xs) 50vw, 250px'
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                  ) : (
                    <div className='w-full h-full p-3 flex flex-col justify-between text-left'>
                      <p className='text-xs text-neutral-400 font-normal line-clamp-4 leading-relaxed'>
                        {savedPost.caption}
                      </p>
                      <span className='text-[10px] text-neutral-600 font-semibold uppercase tracking-wider'>
                        Text Only
                      </span>
                    </div>
                  )}

                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-left'>
                    <p className='text-xs text-white font-medium line-clamp-2 leading-snug'>
                      {savedPost.caption || 'View Story'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedPost !== null && (
        <ImageModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}
