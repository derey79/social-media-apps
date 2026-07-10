import Navbar from '@/components/layout/Navbar';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen bg-[#070A10] text-white flex flex-col'>
      {/* Tempel komponen Navbar premium yang sudah mengikuti aturan Figma */}
      <Navbar />

      {/* Area konten utama halaman-halaman privat (seperti /feed) */}
      <main className='flex-1 w-full max-w-content mx-auto px-6 md:px-container-x py-8'>
        {children}
      </main>
    </div>
  );
}
