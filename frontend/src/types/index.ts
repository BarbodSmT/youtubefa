export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}
export interface CategoryDto {
  name: string;
  icon: string;
  color: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  channelUrl: string;
  publishedAt: string;
  avatar: string;
  bannerImage?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  tags?: string[];
  categoryId: number;
  category?: Category;
  recentVideos?: YouTubeVideo[];
  lastUpdatedAt: string;
  isVip: boolean;
}

export interface Submission {
  id: number;
  channelUrl: string;
  submittedByEmail: string | null;
  categoryId: number;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CreateSubmissionDto {
  channelUrl: string;
  categoryId: number;
  submittedByEmail: string | null;
}

export interface UpdateChannelDto {
  title: string;
  description: string;
  categoryId: number;
  tags?: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}



export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe: boolean | undefined;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponseDto {
  user: User;
  token: string;
}