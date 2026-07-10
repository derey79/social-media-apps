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
    // 💡 Hanya jalankan kueri ini jika token ada DI local storage DAN data user di Redux belum dimuat
    enabled: !!token && !user,
    staleTime: Infinity, // Mencegah pemanggilan berulang-ulang yang tidak perlu
  });

  useEffect(() => {
    if (isSuccess && data?.data?.profile) {
      const { id, name, username, email, phone } = data.data.profile;

      // 💡 RE-HYDRATE: Masukkan data asli profil dari server ke dalam Redux Store
      dispatch(
        updateUser({
          id: String(id), // Konversi ID number ke string agar match dengan tipe state Redux
          name,
          username,
          email,
          phone,
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
