'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  X,
  Send,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import axios from 'axios';

interface CreatePostModalProps {
  onClose: () => void;
}

// const emptySubscribe = () => () => {};
// const getSnapshot = () => true;
// const getServerSnapshot = () => false;

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');

  // 💡 STATE BARU: Menyimpan berkas gambar asli dan string preview lokal di browser
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Referensi DOM untuk memicu jendela pencarian file browser bawaan
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  // 💡 SINKRONISASI SWAGGER: Gunakan FormData & Content-Type Multipart untuk data biner
  const mutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await axiosInstance.post('/posts', payload, {
        headers: {
          'Content-Type': 'multipart/form-data', // Wajib disetel untuk tipe biner ($binary)
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Your new photo story is live! 🚀');
      handleResetForm();
      onClose();

      // Segarkan cache linimasa otomatis tanpa muat ulang browser
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite-list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });
    },
    onError: (error) => {
      let serverMessage =
        'Failed to publish post. Please verify your image file.';
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as
          | { message?: string }
          | undefined;
        serverMessage = errorData?.message || serverMessage;
      }
      toast.error('Publish Failed', { description: serverMessage });
    },
  });

  // Handler penangkap gambar saat file dipilih oleh pengguna
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran maksimal berkas sesuai instruksi Swagger (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Max image size allowed is 5MB.',
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file)); // Buat URL preview temporer untuk visualisasi klien
  };

  const handleResetForm = () => {
    setCaption('');
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl); // Bersihkan memori URL blob browser
    setPreviewUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || mutation.isPending) return;

    // 💡 BUNGKUS PAYLOAD FORM DATA SESUAI KONTRAK SWAGGER API
    const formData = new FormData();
    formData.append('image', selectedImage); // Sesuai kata 'image * required' di gambar Anda
    formData.append('caption', caption); // Sesuai kata 'caption string' di gambar Anda

    mutation.mutate(formData);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200'>
      <div className='relative w-full max-w-lg bg-[#070A10] border border-[#181D27] rounded-[24px] shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 flex flex-col space-y-5'>
        {/* HEADER MODAL */}
        <div className='flex items-center justify-between pb-3 border-b border-[#181D27]'>
          <h3 className='text-base font-bold text-white tracking-tight'>
            Add Post
          </h3>
          <button
            onClick={onClose}
            className='p-1.5 text-neutral-400 hover:text-white bg-neutral-900/40 hover:bg-neutral-800 rounded-full transition cursor-pointer'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* FORM UTAMA */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* SEGMEN 1: AREA UPLOAD PHOTO DENGAN INTEGRASI INPUT FILE ASLI */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-neutral-400 tracking-wide uppercase'>
              Photo
            </label>

            {/* Input hantu disembunyikan secara visual demi mempertahankan kecantikan figma */}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleImageChange}
              accept='image/png, image/jpeg, image/jpg, image/webp'
              className='hidden'
            />

            <div
              onClick={() =>
                !mutation.isPending && fileInputRef.current?.click()
              }
              className='w-full aspect-4/3 sm:aspect-16/10 border-2 border-dashed border-[#181D27] hover:border-neutral-700 bg-[#0B0F17]/60 rounded-2xl flex flex-col items-center justify-center p-4 text-center transition group relative overflow-hidden cursor-pointer'
            >
              {previewUrl ? (
                /* 💡 KONDISI PREVIEW: Jika foto sudah dipilih, tampilkan visualnya langsung di dalam kotak */
                <div className='relative w-full h-full rounded-xl overflow-hidden'>
                  <Image
                    src={previewUrl}
                    alt='Selected upload preview'
                    fill
                    className='object-cover'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 font-bold text-xs'>
                    <ImageIcon className='h-4 w-4' />
                    <span>Ganti Foto</span>
                  </div>
                </div>
              ) : (
                /* KONDISI AWAL FIGMA */
                <>
                  <div className='p-3 bg-neutral-900/50 rounded-xl mb-3 text-neutral-400 group-hover:text-white transition'>
                    <UploadCloud className='h-6 w-6' />
                  </div>
                  <p className='text-sm font-bold text-neutral-200 tracking-tight'>
                    Click to upload or drag and drop
                  </p>
                  <p className='text-xs text-neutral-500 font-medium mt-1'>
                    PNG, JPG, or WEBP (max. 5mb)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* SEGMEN 2: AREA FIELD CAPTION VERTIKAL */}
          <div className='space-y-2'>
            <label
              htmlFor='caption'
              className='text-xs font-bold text-neutral-400 tracking-wide uppercase'
            >
              Caption
            </label>
            <div className='w-full bg-[#0B0F17]/60 border border-[#181D27] rounded-xl p-3.5 focus-within:border-neutral-700 transition'>
              <textarea
                id='caption'
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={mutation.isPending}
                placeholder='Create your caption'
                rows={3}
                className='w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed custom-scrollbar disabled:opacity-50'
                maxLength={280}
              />
            </div>
          </div>

          {/* SEGMEN 3: TOMBOL SHARE DENGAN VALIDASI KEBERADAAN GAMBAR WAJIB */}
          <Button
            type='submit'
            disabled={mutation.isPending || !selectedImage} // Gambar wajib diisi agar tombol aktif
            className='w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2'
          >
            {mutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-3.5 w-3.5' />
            )}
            <span>{mutation.isPending ? 'Sharing...' : 'Share'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
