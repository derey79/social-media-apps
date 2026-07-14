'use client';

interface PostCardSkeletonProps {
  count?: number;
}

export default function PostCardSkeleton({ count = 3 }: PostCardSkeletonProps) {
  return (
    <div className='space-y-5 w-full'>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className='flex items-start justify-between gap-3 w-full animate-pulse'
        >
          {/* Card Utama */}
          <div className='w-full bg-[#0B0F17] border border-[#181D27] rounded-[24px] p-5 space-y-4 text-left'>
            {/* Bagian Header (Avatar & Nama) */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                {/* Placeholder Avatar Lingkaran */}
                <div className='h-10 w-10 rounded-full bg-neutral-800 border border-[#181D27] shrink-0' />

                {/* Placeholder Detail Nama & Tanggal */}
                <div className='flex flex-col gap-2 text-left'>
                  {/* Nama User */}
                  <div className='h-4 bg-neutral-800 rounded w-24' />
                  {/* Timestamp / Username */}
                  <div className='h-3 bg-neutral-800 rounded w-16' />
                </div>
              </div>
            </div>

            {/* Bagian Konten Postingan */}
            <div className='space-y-3 pl-0 sm:pl-13'>
              {/* Placeholder Teks Paragraf */}
              <div className='space-y-2'>
                <div className='h-3.5 bg-neutral-800 rounded w-full' />
                <div className='h-3.5 bg-neutral-800 rounded w-11/12' />
                <div className='h-3.5 bg-neutral-800 rounded w-4/5' />
              </div>

              {/* Placeholder Media / Gambar Postingan */}
              <div className='relative w-full aspect-video rounded-2xl overflow-hidden border border-[#181D27] bg-neutral-800/50 max-h-100' />
            </div>

            {/* Bagian Footer (Tombol Like, Comment, Share) */}
            <div className='flex items-center gap-6 pt-4 pl-0 sm:pl-13 border-t border-[#181D27]/40'>
              <div className='h-4 bg-neutral-800 rounded w-12' />
              <div className='h-4 bg-neutral-800 rounded w-12' />
              <div className='h-4 bg-neutral-800 rounded w-12' />
            </div>
          </div>

          {/* Placeholder Tombol Menu Aksi (Titik Tiga di Kanan Atas) */}
          <div className='h-5 w-5 bg-neutral-800 rounded-full shrink-0 mt-2' />
        </div>
      ))}
    </div>
  );
}
