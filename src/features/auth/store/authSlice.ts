import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserProfile, UserStats } from '@/types/types';

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('social_auth_token');
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  user: null,
  stats: null, // Initial nilai awal kosong sebelum ditarik dari server
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: UserProfile;
        stats?: UserStats;
      }>
    ) => {
      const { token, user, stats } = action.payload;
      state.token = token;
      state.user = user;
      state.stats = stats || { posts: 0, followers: 0, following: 0, likes: 0 };
      state.isAuthenticated = true;

      // 1. Simpan di LocalStorage untuk kebutuhan TanStack Query client-side Anda
      localStorage.setItem('social_auth_token', token);

      // 💡 2. SINKRONISASI BARU: Simpan di Cookie Browser agar terbaca oleh Middleware Server
      // Menggunakan max-age selama 7 hari (604800 detik) dengan path global (/)
      if (typeof window !== 'undefined') {
        document.cookie = `social_auth_token=${token}; max-age=604800; path=/; SameSite=Lax; Secure`;
      }
    },

    logOutAction: (state) => {
      state.token = null;
      state.user = null;
      state.stats = null;
      state.isAuthenticated = false;

      localStorage.removeItem('social_auth_token');

      // 💡 PASTIKAN ATURAN PENGHAPUSAN COOKIE INI TERTULIS SEMPURNA
      if (typeof window !== 'undefined') {
        // Menyetel expires ke tanggal masa lalu (Thursday, 01 Jan 1970) memaksa browser menghapus cookie seketika
        document.cookie =
          'social_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure';
      }
    },

    updateUser: (
      state,
      action: PayloadAction<{ user: UserProfile; stats: UserStats }>
    ) => {
      state.user = action.payload.user;
      state.stats = action.payload.stats;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logOutAction, updateUser } = authSlice.actions;
export default authSlice.reducer;
