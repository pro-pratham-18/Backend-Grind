import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  interviews: [],
  tests: [],
  loading: false,
  error: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setInterviews: (state, action) => {
      state.interviews = action.payload;
    },
    setTests: (state, action) => {
      state.tests = action.payload;
    },
    addInterview: (state, action) => {
      state.interviews.unshift(action.payload);
    },
    addTest: (state, action) => {
      state.tests.unshift(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setInterviews, setTests, addInterview, addTest, setLoading, setError } =
  historySlice.actions;
export default historySlice.reducer;
