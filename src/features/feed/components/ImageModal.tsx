'use client';

import { useState } from 'react'; // 💡 SUNTIKKAN: Impor useEffect untuk sinkronisasi properti
import { X, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostItem } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import ModalImagePreview from './modals/ModalImagePreview';
import ModalCommentList from './modals/ModalCommentList';
import ModalCommentForm from './modals/ModalCommentForm';
import { formatPostTimestamp } from '@/constanta/formatPostTimestamp';

interface ImageModalProps {
  post: PostItem;
  onClose: () => void;
}

export default function ImageModal({ post, onClose }: ImageModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [localLikedByMe, setLocalLikedByMe] = useState(post.likedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);

  const [prevPostId, setPrevPostId] = useState(post.id);
  // =========================================================================
  // 👑 KUNCI KESELARASAN PROPERTI MODAL (INTERNAL PROPS SYNC):
  // Menjamin jika ada perubahan data dari luar, state lokal modal langsung ikut sinkron.
  // =========================================================================

  if (post.id !== prevPostId) {
    setLocalLikedByMe(post.likedByMe);
    setLocalLikeCount(post.likeCount);
    setPrevPostId(post.id);
  }

  // useEffect(() => {
  //   setLocalLikedByMe(post.likedByMe);
  //   setLocalLikeCount(post.likeCount);
  // }, [post.likedByMe, post.likeCount]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 💡 PERBAIKAN 1: SINKRONISASI JALUR KLIK AVATAR KE UNIFIED PROFILE STRATEGY
  const handleNavigateToAuthor = () => {
    onClose(); // Tutup modal overlay terlebih dahulu

    // Alihkan rute dari /user/ menjadi masuk ke rute bersih bersatu atap /profile/
    const safeUsername = encodeURIComponent(post.author.username);
    router.push(`/profile/${safeUsername}`);
  };

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
      // 1. Segarkan Tab Explore Linimasa Global Anda (Membuat Feed di bawah ikut berubah!)
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite-list'] });

      // 2. Segarkan Tab Feed Personal Lini Masa Akun Anda
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });

      // 3. Segarkan seluruh matriks counter angka Likes di profil pribadi & publik
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // 4. Segarkan kueri detail postingan ini jika ada
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: () => {
      // Kembalikan state jika server Railway mengalami kendala/runtuh
      setLocalLikedByMe(post.likedByMe);
      setLocalLikeCount(post.likeCount);
      toast.error('Failed to sync like action from modal view 💔');
    },
  });

  const handleLikeClick = () => {
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

  if (!post.imageUrl) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/90 backdrop-blur-md animate-in fade-in duration-200'>
      <div className='relative w-full max-w-6xl h-[85vh] border border-[#181D27] rounded-[24px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl'>
        <ModalImagePreview imageUrl={post.imageUrl} />

        <div className='lg:col-span-5 flex flex-col h-full bg-[#070A10] relative text-left'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white bg-neutral-900/40 hover:bg-neutral-800 rounded-full transition-all cursor-pointer z-10'
          >
            <X className='h-4 w-4' />
          </button>

          <div className='p-5 flex items-center gap-3 border-b border-[#181D27]'>
            <Avatar
              onClick={handleNavigateToAuthor}
              className='h-10 w-10 border border-[#181D27] shrink-0 cursor-pointer hover:opacity-80 transition'
            >
              <AvatarImage
                src={post.author.avatarUrl || undefined}
                alt={post.author.name}
              />
              <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span
                onClick={handleNavigateToAuthor}
                className='text-sm font-bold text-white tracking-tight cursor-pointer hover:underline'
              >
                {post.author.name}
              </span>
              <span className='text-xs text-neutral-500'>
                {formatPostTimestamp(post.createdAt)}
              </span>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar'>
            <div className='space-y-1 text-sm leading-relaxed'>
              <span className='font-bold text-white mr-2'>
                {post.author.name}
              </span>
              <span className='text-neutral-200 whitespace-pre-wrap'>
                {post.caption}
              </span>
            </div>

            <div className='border-b border-[#181D27]/40 pt-2' />
            <p className='text-xs font-bold text-neutral-400 uppercase tracking-wider'>
              Comments
            </p>

            <ModalCommentList
              postId={post.id}
              getInitials={getInitials}
              formatCommentTime={formatPostTimestamp}
            />
          </div>

          <div className='p-4 border-t border-[#181D27] flex items-center justify-between text-neutral-400'>
            <div className='flex items-center gap-4'>
              {/* TOMBOL LIKE REAKTIF MAPS */}
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 text-xs font-bold transition group cursor-pointer ${
                  localLikedByMe
                    ? 'text-rose-500 hover:text-rose-400'
                    : 'hover:text-rose-500'
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-all transform active:scale-125 ${
                    localLikedByMe
                      ? 'fill-rose-500 text-rose-500 scale-105'
                      : 'text-neutral-400'
                  }`}
                />
                <span>{localLikeCount}</span>
              </button>

              <button className='flex items-center gap-1.5 text-xs font-bold hover:text-white transition cursor-pointer'>
                <MessageCircle className='h-5 w-5' />
                <span>{post.commentCount}</span>
              </button>
            </div>

            <div className='flex items-center gap-2'>
              <button className='p-1.5 hover:text-white transition cursor-pointer'>
                <Bookmark className='h-5 w-5' />
              </button>
              <button className='p-1.5 hover:text-white transition cursor-pointer'>
                <Share2 className='h-5 w-5' />
              </button>
            </div>
          </div>

          <ModalCommentForm postId={post.id} />
        </div>
      </div>
    </div>
  );
}
