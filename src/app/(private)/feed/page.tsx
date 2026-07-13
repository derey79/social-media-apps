'use client';

import { useState, useSyncExternalStore } from 'react'; // 💡 HAPUS total useEffect dari daftar impor
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useScrollDirection } from '@/features/auth/hooks/useScrollDirection';
import { toast } from 'sonner';

import ExploreTimeline from '@/features/feed/components/ExploreTimeline';
import HomeTimeline from '@/features/feed/components/HomeTimeline';
import FeedTabs from '@/features/feed/components/FeedTabs';
import FeedBottomNav from '@/features/feed/components/FeedBottomNav';
import CreatePostModal from '@/features/feed/components/CreatePostModal';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function FeedPage() {
  const router = useRouter();
  const isVisible = useScrollDirection();
  const searchParams = useSearchParams();

  // Baca parameter kueri ?tab=feed dari klik logo
  const tabQuery = searchParams.get('tab');

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  const activeTab = isClient && isAuthenticated ? 'feed' : 'explore';
  const [manualTab, setManualTab] = useState<'feed' | 'explore' | null>(null);
  const [prevTabQuery, setPrevIsTabQuery] = useState<string | null>(null);

  // =========================================================================
  // 👑 KUNCI DERIVATIF LOGO RESET (ANTI-CASCADING RENDER & EFFECTLESS):
  // Jika rendering mendeteksi adanya kedatangan parameter ?tab=feed baru dari URL,
  // langsung paksa ubah state penentu arah di sini saat rendering berjalan.
  // Logika ini melenyapkan siklus useEffect dan menghancurkan peringatan linter 100%!
  // =========================================================================
  if (tabQuery !== prevTabQuery) {
    if (tabQuery === 'feed') {
      setManualTab(null); // Reset manual tab seketika ke default activeTab (feed)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Gulir halus ke atas layar
      }
    }
    setPrevIsTabQuery(tabQuery);
  }

  const currentTab = manualTab !== null ? manualTab : activeTab;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handlePlusAction = () => {
    if (!isAuthenticated) {
      toast.warning('Authentication Required', {
        description: 'Please sign in to write and publish your own stories!',
      });
      router.push('/login');
    } else {
      setIsCreateOpen(true);
    }
  };

  return (
    <div className='w-full min-h-screen text-center relative pb-32'>
      {/* 1. TOP FLOATING TABS */}
      <FeedTabs
        activeTab={currentTab}
        setActiveTab={setManualTab}
        isVisible={isVisible}
      />

      {/* AREA KONTEN UTAMA TIMELINE FEEDS */}
      <div className='w-full max-w-xl mx-auto space-y-6 pt-16 text-left'>
        {!isClient ? (
          <div className='space-y-4'>
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className='w-full h-48 bg-[#0B0F17] border border-[#181D27] rounded-[24px] animate-pulse'
              />
            ))}
          </div>
        ) : (
          <>
            {currentTab === 'explore' && <ExploreTimeline />}
            {currentTab === 'feed' && <HomeTimeline />}
          </>
        )}
      </div>

      {/* menu floating dock di bawah */}
      <FeedBottomNav
        isVisible={isVisible}
        handlePlusAction={handlePlusAction}
      />

      {isCreateOpen && (
        <CreatePostModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
