import Navbar from '@/components/layout/Navbar';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-1 w-full max-w-content mx-auto px-6 md:px-container-x py-8'>
        {children}
      </main>
    </div>
  );
}
