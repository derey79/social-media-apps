'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Home, Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import { PostItem } from '@/types/types';

// 💡 PERBAIKAN 1: SINKRONISASI PAYLOAD RESPON /api/feed
interface FeedApiResponse {
  success: boolean;
  message: string;
  data: {
    items: PostItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function HomeTimeline() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<FeedApiResponse>({
    queryKey: ['posts', 'home-feed-list'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(
        `/feed?page=${pageParam}&limit=10`
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 3, // Cache aman selama 3 menit
  });

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const feedItemsList = data?.pages.flatMap((page) => page.data.items) || [];

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className='w-full h-48 bg-[#0B0F17] border border-[#181D27] rounded-[24px] animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center space-y-2'>
        <p className='text-sm font-semibold text-red-400'>
          Failed to stream your personalized feed
        </p>
        <Button
          onClick={() => refetch()}
          variant='outline'
          className='h-8 text-xs border-red-900 bg-transparent text-white cursor-pointer'
        >
          Retry
        </Button>
      </div>
    );
  }

  if (feedItemsList.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 space-y-4 text-center'>
        <div className='p-4 bg-[#0B0F17] border border-[#181D27] rounded-full text-neutral-400'>
          <Home className='h-8 w-8' />
        </div>
        <p className='text-sm font-medium text-neutral-400'>
          Your feed is quiet. Start following friends or write your first story!
          ✨
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {feedItemsList.map((postItem) => (
        <PostCard key={postItem.id} post={postItem} />
      ))}

      <div
        ref={loadMoreRef}
        className='w-full py-6 flex items-center justify-center'
      >
        {isFetchingNextPage && (
          <div className='flex items-center gap-2 text-sm text-neutral-400 font-medium'>
            <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
            <span>Streaming your feed...</span>
          </div>
        )}
        {!hasNextPage && (
          <p className='text-xs text-neutral-500 font-semibold uppercase tracking-wider select-none'>
            🎉 You are completely caught up!
          </p>
        )}
      </div>
    </div>
  );
}
