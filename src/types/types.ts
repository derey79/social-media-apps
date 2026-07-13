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

// post
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
