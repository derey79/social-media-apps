'use client';

import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 💡 Tolong sembunyikan jika di-scroll ke bawah, dan munculkan jika di-scroll ke atas
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // Scroll ke bawah -> Sembunyikan
      } else {
        setIsVisible(true); // Scroll ke atas -> Munculkan
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return isVisible;
}
