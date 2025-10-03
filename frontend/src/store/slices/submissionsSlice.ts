import { createSlice } from '@reduxjs/toolkit';
import type { Submission } from '../../types';

interface SubmissionsState {
  items: Submission[];
  loading: boolean;
  error: string | null;
}

const initialState: SubmissionsState = {
  items: [],
  loading: false,
  error: null,
};

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {},
});

export default submissionsSlice.reducer;