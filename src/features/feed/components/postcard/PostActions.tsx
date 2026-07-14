'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, Loader2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { PostItem } from '@/types/types';

interface PostActionsProps {
  post: PostItem;
  onCommentClick: () => void;
}

interface SaveApiResponse {
  success: boolean;
  message: string;
  data: {
    saved: boolean;
  };
}

export default function PostActions({
  post,
  onCommentClick,
}: PostActionsProps) {
  const queryClient = useQueryClient();

  const [localLikedByMe, setLocalLikedByMe] = useState(post.likedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [localIsSaved, setLocalIsSaved] = useState(post.savedByMe);

  // 💡 TRACKER STATE SEBELUMNYA (MENGUNCI SINKRONISASI LIKES & COMMENTS LINTAS VIEW MODAL)
  const [prevPostId, setPrevPostId] = useState(post.id);
  const [prevSavedByMe, setPrevSavedByMe] = useState(post.savedByMe);
  const [prevLikeCount, setPrevLikeCount] = useState(post.likeCount);
  const [prevLikedByMe, setPrevLikedByMe] = useState(post.likedByMe);
  const [prevCommentCount, setPrevCommentCount] = useState(post.commentCount); // ✨ SUNTIKKAN: Pelacak jumlah komentar lama

  // =========================================================================
  // 👑 KUNCI EMAS REAKTIF KOMENTAR TIMBAL BALIK (STRICT COMPONENT OVERRIDE STRATEGY):
  // Jika rendering mendeteksi ID berganti ATAU jumlah Likes, status interaksi,
  // maupun JUMLAH KOMENTAR BARU (pasca-submit di form komentar ImageModal) berubah,
  // paksa baris state lokal kartu feed ini untuk ikut berbalik arah seketika!
  // =========================================================================
  if (
    post.id !== prevPostId ||
    post.likeCount !== prevLikeCount ||
    post.likedByMe !== prevLikedByMe ||
    post.commentCount !== prevCommentCount // ✨ Deteksi jika ada lonjakan komentar baru dari modal luar
  ) {
    setLocalLikedByMe(post.likedByMe);
    setLocalLikeCount(post.likeCount);
    setLocalIsSaved(post.savedByMe);
    setPrevPostId(post.id);
    setPrevSavedByMe(post.savedByMe);
    setPrevLikeCount(post.likeCount);
    setPrevLikedByMe(post.likedByMe);
    setPrevCommentCount(post.commentCount); // ✨ Selaraskan angka tracker komentar saat rendering
  }

  if (post.savedByMe !== prevSavedByMe) {
    setLocalIsSaved(post.savedByMe);
    setPrevSavedByMe(post.savedByMe);
  }

  const toggleLikeMutation = useMutation({
    mutationFn: async (isCurrentlyLiked: boolean) => {
      if (isCurrentlyLiked) {
        return (await axiosInstance.delete(`/posts/${post.id}/like`)).data;
      } else {
        return (await axiosInstance.post(`/posts/${post.id}/like`)).data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'explore-list'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: () => {
      setLocalLikedByMe(post.likedByMe);
      setLocalLikeCount(post.likeCount);
      toast.error('Failed to sync like action with server 💔');
    },
  });

  const toggleSaveMutation = useMutation<
    SaveApiResponse,
    Error,
    { wasSaved: boolean }
  >({
    mutationFn: async () => {
      const response = await axiosInstance.post(`/posts/${post.id}/save`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'explore-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'my-saved-list'] });

      toast.success(
        variables.wasSaved
          ? 'Removed from bookmarks'
          : 'Post saved to bookmarks! 📑'
      );
    },
    onError: (_, variables) => {
      setLocalIsSaved(variables.wasSaved);
      toast.error('Failed to sync bookmark status with server 💔');
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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggleSaveMutation.isPending) return;

    const currentSavedState = localIsSaved;
    setLocalIsSaved(!currentSavedState);
    toggleSaveMutation.mutate({ wasSaved: currentSavedState });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast.success('Link copied to clipboard! 🚀');
  };

  return (
    <div className='flex items-center gap-6 pt-2 border-t border-[#181D27]/40 text-neutral-400 select-none'>
      {/* Tombol Like */}
      <button
        onClick={handleLikeClick}
        disabled={toggleLikeMutation.isPending}
        className={`flex items-center gap-2 text-xs font-semibold group transition cursor-pointer ${
          localLikedByMe ? 'text-rose-500' : 'hover:text-rose-500'
        }`}
      >
        <div
          className={`p-2 rounded-xl transition ${localLikedByMe ? 'bg-rose-500/5' : 'group-hover:bg-rose-500/10'}`}
        >
          <Heart
            className={`h-4 w-4 transition-transform active:scale-125 ${localLikedByMe ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </div>
        <span className='text-white'>{localLikeCount}</span>
      </button>

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

        <span className='text-white'>{post.commentCount}</span>
      </button>

      <div className='flex items-center gap-1 ml-auto'>
        {/* Tombol Share */}
        <button
          onClick={handleShareClick}
          className='flex items-center gap-2 text-xs font-semibold group hover:text-teal-500 transition cursor-pointer'
        >
          <div className='p-2 rounded-xl group-hover:bg-teal-500/10 transition'>
            <Share2 className='h-4 w-4' />
          </div>
        </button>

        {/* Tombol Bookmark */}
        <button
          onClick={handleSaveClick}
          disabled={toggleSaveMutation.isPending}
          className={`flex items-center text-xs font-semibold group transition cursor-pointer rounded-xl ${
            localIsSaved ? 'text-amber-500' : 'hover:text-amber-500'
          }`}
        >
          <div
            className={`p-2 rounded-xl transition ${localIsSaved ? 'bg-amber-500/5' : 'group-hover:bg-amber-500/10'}`}
          >
            {toggleSaveMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin text-amber-500' />
            ) : (
              <Bookmark
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  localIsSaved ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
