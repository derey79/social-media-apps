'use client';

import Image from 'next/image';

interface ModalImagePreviewProps {
  imageUrl: string;
}

export default function ModalImagePreview({
  imageUrl,
}: ModalImagePreviewProps) {
  return (
    <div className='relative w-full h-[40vh] lg:h-full bg-background flex items-center justify-center lg:col-span-7'>
      <Image
        src={imageUrl}
        alt='Post media content preview'
        fill
        sizes='(max-w-6xl) 100vw, 700px'
        className='object-cover'
        priority
      />
    </div>
  );
}
