'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance } from '@/lib/axios';
import { updateUser, logOutAction } from '@/features/auth/store/authSlice';
import { RootState } from '@/lib/store';

// Definisikan interface sesuai skema respons data asli API /me Anda
interface MeApiResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: number;
      name: string;
      username: string;
      email: string;
      phone: string;
      bio: string | null;
      avatarUrl: string | null;
      createdAt: string;
    };
    stats: {
      posts: number;
      followers: number;
      following: number;
      likes: number;
    };
  };
}

export function usePersistAuth() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Ambil token dari localStorage jika berada di lingkungan browser
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('social_auth_token')
      : null;

  const { data, error, isLoading, isSuccess } = useQuery<MeApiResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await axiosInstance.get('/me');
      return response.data;
    },
    // Hanya jalankan kueri ini jika token ada di local storage DAN data user di Redux belum dimuat
    enabled: !!token && !user,
    staleTime: Infinity, // Mencegah pemanggilan berulang-ulang yang tidak perlu
  });

  useEffect(() => {
    // 💡 SINKRONISASI BARU: Pastikan data profile DAN data stats ikut terekstrak
    if (isSuccess && data?.data?.profile && data?.data?.stats) {
      const { id, name, username, email, phone, bio, avatarUrl } =
        data.data.profile;
      const { posts, followers, following, likes } = data.data.stats;

      // 💡 RE-HYDRATE SINKRON: Kirimkan objek bersarang sesuai cetak biru Redux Slice terbaru Anda
      dispatch(
        updateUser({
          user: {
            id: String(id),
            name,
            username,
            email,
            phone,
            bio,
            avatarUrl,
          },
          stats: {
            posts,
            followers,
            following,
            likes,
          },
        })
      );
    }

    if (error) {
      // Jika token kedaluwarsa atau tidak valid di server, bersihkan sesi secara otomatis
      dispatch(logOutAction());
    }
  }, [isSuccess, data, error, dispatch]);

  return {
    isLoadingPersist: isLoading && !!token,
    isAuthenticated: !!token,
  };
}
