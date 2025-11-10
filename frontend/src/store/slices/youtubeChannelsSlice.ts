import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { YouTubeChannel } from '../../types';

interface YoutubeChannelsState {
  items: YouTubeChannel[];
  loading: boolean;
  error: string | null;
  categoryFilter: string;
  sortBy: "recent" | "name" | "subscribers" | "videos";
  searchQuery: string;
  detailedChannel: YouTubeChannel | null;
  detailedChannelLoading: boolean;
  detailedChannelError: string | null;
}

const initialState: YoutubeChannelsState = {
  items: [],
  loading: false,
  error: null,
  categoryFilter: 'همه دسته‌ها',
  sortBy: 'subscribers',
  searchQuery: '',
  detailedChannel: null,
  detailedChannelLoading: false,
  detailedChannelError: null,
};

const youtubeChannelsSlice = createSlice({
  name: 'youtubeChannels',
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<YouTubeChannel[]>) => {
      state.items = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
    },
    setSortBy(state, action: PayloadAction<"recent" | "name" | "subscribers" | "videos">) {
      state.sortBy = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const { setChannels, setCategoryFilter, setSortBy, setSearchQuery } = youtubeChannelsSlice.actions;
export default youtubeChannelsSlice.reducer;
