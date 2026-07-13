'use client';

import { useState, useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CreatePostCard() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  // Ambil data user aktif dari Redux Store untuk menampilkan foto profil di sebelah input
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Integrasi TanStack Mutation untuk menembak endpoint POST /posts milik API Railway Anda
  const mutation = useMutation({
    mutationFn: async (text: string) => {
      // Menyesuaikan payload standar API media sosial umum: { content: "isi tulisan" }
      const response = await axiosInstance.post('/posts', { content: text });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Post published successfully! 🚀');
      setContent(''); // Bersihkan kolom teks setelah berhasil posting

      // otomatis memicu penarikan data ulang (refetch) pada daftar feed posts Anda nanti
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
    },
    onError: (error) => {
      let serverMessage = 'Failed to create post. Please try again.';
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as
          | { message?: string }
          | undefined;
        serverMessage = errorData?.message || serverMessage;
      }
      toast.error('Post Failed', { description: serverMessage });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate(content);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Jika user belum login (browsing sebagai guest), sembunyikan panel input postingan ini
  if (isClient && !isAuthenticated) return null;

  return (
    <div className='w-full max-w-xl bg-[#0B0F17] border border-[#181D27] rounded-[24px] p-5 space-y-4 text-left transition-all'>
      <form onSubmit={handleSubmit} className='flex gap-4 items-start'>
        {/* FOTO PROFIL DINAMIS USER */}
        <Avatar className='h-10 w-10 border border-[#181D27] shrink-0'>
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
          <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
            {isClient ? getInitials(user?.name || 'reymond') : '??'}
          </AvatarFallback>
        </Avatar>

        {/* AREA INPUT TEKS POSTINGAN */}
        <div className='flex-1 space-y-3'>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${isClient ? user?.name || 'reymond' : '...'}?`}
            rows={3}
            className='w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none resize-none leading-relaxed pt-1'
            maxLength={280} // Membatasi karakter layaknya standar Twitter/X
          />

          <div className='flex items-center justify-between pt-2 border-t border-[#181D27]/60'>
            {/* Tombol dekoratif opsional untuk fitur media masa depan */}
            <button
              type='button'
              className='p-2 text-neutral-400 hover:text-blue-500 hover:bg-neutral-900/40 rounded-xl transition cursor-not-allowed'
              title='Image upload features coming soon'
              disabled
            >
              <ImageIcon className='h-4 w-4' />
            </button>

            {/* TOMBOL SUBMIT STATUS */}
            <Button
              type='submit'
              disabled={mutation.isPending || !content.trim()}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all'
            >
              {mutation.isPending ? (
                <div className='h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <Send className='h-3 w-3' />
              )}
              <span>{mutation.isPending ? 'Posting...' : 'Post'}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
