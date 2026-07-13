'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { PostItem } from '@/types/types';

interface PostActionsProps {
  post: PostItem;
  onCommentClick: () => void;
}

export default function PostActions({
  post,
  onCommentClick,
}: PostActionsProps) {
  const queryClient = useQueryClient();

  const [localLikedByMe, setLocalLikedByMe] = useState(post.likedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);

  // 💡 STATE PELACAK ID SEBELUMNYA (ANTI-CASCADING RENDER SINKRONISASI MODAL DETIL)
  const [prevPostId, setPrevPostId] = useState(post.id);

  // =========================================================================
  // 👑 KUNCI EMAS PENYELARAS FEED (EFFECTLESS STATE RE-SYNC):
  // Jika rendering mendeteksi ID postingan sama namun data cache luar diperbarui
  // (misal pasca klik Like di dalam modal), paksa sinkronisasi ulang state lokal
  // di halaman beranda secara instan SAAT RENDERING berjalan tanpa efek samping!
  // =========================================================================
  if (
    post.id !== prevPostId ||
    post.likeCount !== localLikeCount ||
    post.likedByMe !== localLikedByMe
  ) {
    setLocalLikedByMe(post.likedByMe);
    setLocalLikeCount(post.likeCount);
    setPrevPostId(post.id);
  }

  // Mutasi untuk Hit API Like / Unlike Idempotent
  const toggleLikeMutation = useMutation({
    mutationFn: async (isCurrentlyLiked: boolean) => {
      if (isCurrentlyLiked) {
        const response = await axiosInstance.delete(`/posts/${post.id}/like`);
        return response.data;
      } else {
        const response = await axiosInstance.post(`/posts/${post.id}/like`);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => {
      setLocalLikedByMe(post.likedByMe);
      setLocalLikeCount(post.likeCount);
      toast.error('Failed to sync like action with server 💔');
    },
  });

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggleLikeMutation.isPending) return;

    toggleLikeMutation.mutate(localLikedByMe);

    if (localLikedByMe) {
      setLocalLikedByMe(false);
      setLocalLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setLocalLikedByMe(true);
      setLocalLikeCount((prev) => prev + 1);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast.success('Link copied to clipboard! 🚀');
  };

  return (
    <div className='flex items-center gap-6 pt-2 border-t border-[#181D27]/40 text-neutral-400'>
      {/* Tombol Like */}
      <button
        onClick={handleLikeClick}
        className={`flex items-center gap-2 text-xs font-semibold group transition cursor-pointer ${
          localLikedByMe
            ? 'text-rose-500 hover:text-rose-400'
            : 'hover:text-rose-500'
        }`}
      >
        <div
          className={`p-2 rounded-xl transition ${
            localLikedByMe
              ? 'bg-rose-500/5 group-hover:bg-rose-500/10'
              : 'group-hover:bg-rose-500/10'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform active:scale-125 ${
              localLikedByMe ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </div>
        <span>{localLikeCount}</span>
      </button>

      {/* Tombol Comment */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick();
        }}
        className='flex items-center gap-2 text-xs font-semibold group hover:text-blue-500 transition cursor-pointer'
      >
        <div className='p-2 rounded-xl group-hover:bg-blue-500/10 transition'>
          <MessageCircle className='h-4 w-4' />
        </div>
        <span>{post.commentCount}</span>
      </button>

      {/* Tombol Share */}
      <button
        onClick={handleShareClick}
        className='flex items-center gap-2 text-xs font-semibold group hover:text-teal-500 transition ml-auto cursor-pointer'
      >
        <div className='p-2 rounded-xl group-hover:bg-teal-500/10 transition'>
          <Share2 className='h-4 w-4' />
        </div>
      </button>
    </div>
  );
}
