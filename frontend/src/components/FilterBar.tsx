import React, { useMemo, memo, useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, TextField, MenuItem, Select, InputLabel, FormControl, InputAdornment, IconButton, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { setSearchQuery, setCategoryFilter, setSortBy } from '../store';
import { useGetCategoriesQuery } from '../store';

const sortOptions = [
  { value: 'subscribers', label: 'بیشترین مشترکین' },
  { value: 'videos', label: 'بیشترین ویدیوها' },
  { value: 'recent', label: 'جدیدترین' },
  { value: 'name', label: 'نام' },
];

const FilterBar: React.FC = memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { searchQuery, categoryFilter, sortBy } = useSelector(
    (state: RootState) => state.youtubeChannels
  );

  const { data: categoriesFromApi, isLoading: categoriesLoading } = useGetCategoriesQuery();
  
  const categories = useMemo(() => {
    const allCategoriesOption = { id: 0, name: 'همه دسته‌ها', icon: '', color: '' };
    return [allCategoriesOption, ...(categoriesFromApi || [])];
  }, [categoriesFromApi]);

  const handleCategoryChange = useCallback((event: SelectChangeEvent) => {
    dispatch(setCategoryFilter(event.target.value as string));
  }, [dispatch]);

  const handleSortChange = useCallback((event: SelectChangeEvent) => {
    dispatch(setSortBy(event.target.value as 'name' | 'subscribers' | 'videos' | 'recent'));
  }, [dispatch]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(event.target.value));
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: { xs: 'center', md: 'space-between' },
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography variant="h6" sx={{ mb: { xs: 1, md: 0 }, fontWeight: 600, ml: 2 }}>
        دسته‌بندی و فیلتر
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
        <TextField
          variant="outlined"
          placeholder="جستجو..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel id="category-label">دسته‌بندی</InputLabel>
          <Select
            labelId="category-label"
            value={categoryFilter}
            label="دسته‌بندی"
            onChange={handleCategoryChange}
            disabled={categoriesLoading}
          >
            {categoriesLoading ? (
              <MenuItem value={categoryFilter}>
                <Skeleton width={100} />
              </MenuItem>
            ) : (
              categories.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {`${option.icon} ${option.name}`}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="sort-label">مرتب‌سازی بر اساس</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            label="مرتب‌سازی بر اساس"
            onChange={handleSortChange}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;

