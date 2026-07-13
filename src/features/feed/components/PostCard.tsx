'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PostItem } from '@/types/types';
import PostHeader from './postcard/PostHeader';
import PostActions from './postcard/PostActions';
import ImageModal from './ImageModal';

export default function PostCard({ post }: { post: PostItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className='w-full border border-[#181D27] rounded-[24px] p-5 space-y-4 text-left transition-all hover:border-neutral-800'>
      <PostHeader author={post.author} createdAt={post.createdAt} />

      {/* 2. Konten Tengah */}
      <div className='space-y-3 pl-0'>
        {post.imageUrl && (
          <div
            onClick={() => setIsModalOpen(true)}
            className='relative w-full aspect-video rounded-2xl overflow-hidden border border-[#181D27] bg-neutral-950/40 max-h-100 cursor-zoom-in'
          >
            <Image
              src={post.imageUrl}
              alt={`Post content by ${post.author.name}`}
              fill
              sizes='(max-w-xl) 100vw, 500px'
              className='object-cover hover:scale-[1.01] transition-transform duration-300'
              priority={post.id === 267} // Sesuai ID post teratas di database Anda saat ini
              loading={post.id === 267 ? undefined : 'lazy'}
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            />
          </div>
        )}
        <p className='text-sm text-neutral-50/80 font-normal leading-relaxed whitespace-pre-wrap pt-1'>
          {post.caption}
        </p>
      </div>

      {/* 3. Tombol Aksi Bawah */}
      <PostActions post={post} onCommentClick={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <ImageModal post={post} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
