import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useDebounce } from './useDebounce';
import type { YouTubeChannel } from '../types';


export const useFilteredChannels = (channels: YouTubeChannel[] = []) => {
  const { searchQuery, categoryFilter, sortBy } = useSelector(
    (state: RootState) => state.youtubeChannels
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredAndSortedChannels = useMemo(() => {
    if (!channels) return [];

    let filtered = [...channels];

    if (categoryFilter && categoryFilter !== 'همه دسته‌ها') {
      filtered = filtered.filter(
        (channel) => channel.category?.name === categoryFilter
      );
    }

    const query = debouncedSearchQuery?.toLowerCase().trim();
    if (query) {
      const searchWords = query.split(' ').filter(word => word.length > 0);
      filtered = filtered.filter((channel) => {
        const searchableText = [
          channel.title,
          channel.description,
          channel.category?.name, 
          channel.tags,        
        ].join(' ').toLowerCase();

        return searchWords.every(word => searchableText.includes(word));
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "subscribers":
          return b.subscriberCount - a.subscriberCount;
        case "videos":
          return b.videoCount - a.videoCount;
        case "recent":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case "name":
        default:
          return a.title.localeCompare(b.title, "fa");
      }
    });

    return filtered;
  }, [channels, debouncedSearchQuery, categoryFilter, sortBy]);

  return {
    filteredChannels: filteredAndSortedChannels,
    categoryFilter,
    sortBy,
  };
};

