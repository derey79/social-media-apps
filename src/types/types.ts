// user auth
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
  likes: number;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  stats: UserStats | null; // 💡 2. Daftarkan wadah penampung stats di sini
  isAuthenticated: boolean;
}

//navbar

interface SearchedUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

export interface SearchApiResponse {
  success: boolean;
  message: string;
  data: {
    users: SearchedUser[];
  };
}

export interface NavSearchBarProps {
  isClient: boolean;
  isAuthenticated: boolean;
  getInitials: (name: string) => string;
}

interface NavUserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface NavUserMenuProps {
  isClient: boolean;
  isAuthenticated: boolean;
  user: NavUserProfile | null;
  getInitials: (name: string) => string;
  handleLogout: () => void;
}

//profile
export interface SavedApiResponse {
  success: boolean;
  message: string;
  data: {
    posts: PostItem[];
  };
}

export interface ProfileTabsProps {
  username: string;
  isMyProfile: boolean;
  initialPosts: PostItem[];
}

export interface PublicProfileStatsProps {
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
  isClient: boolean;
  username: string;
  isMyProfile?: boolean;
}

// post
// export interface PostAuthor {
//   id: number;
//   username: string;
//   name: string;
//   avatarUrl: string | null;
// }

// export interface PostItem {
//   id: number;
//   imageUrl: string | null;
//   caption: string;
//   createdAt: string;
//   author: PostAuthor;
//   likeCount: number;
//   commentCount: number;
//   likedByMe: boolean;
// }

export interface PostHeaderProps {
  author: {
    id: number;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  likedByMe?: boolean;
}

export interface PostAuthor {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface PostItem {
  id: number;
  imageUrl: string | null;
  caption: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean; // 💡 SUNTIKKAN SINKRONISASI BARU: Menjaga konsistensi nama variabel backend Anda!
}

export interface PostItem {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean; // 💡 SUNTIKKAN BARIS INI: Untuk status reaktif bookmark
  user: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
}

// follow unfollow
interface FollowUserItem {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

export interface FollowApiResponse {
  success: boolean;
  message: string;
  data: {
    users: FollowUserItem[];
  };
}

export interface FollowModalProps {
  username: string;
  type: 'followers' | 'following';
  onClose: () => void;
  isMyProfile?: boolean;
}
