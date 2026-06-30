import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: {
    role: null,
    difficulty: null,
    questionCount: null,
  },
  questions: [],
  currentIndex: 0,
  status: 'idle',
  timeRemaining: 0,
  loading: false,
  error: null,
  results: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
      state.status = 'setting-up';
    },
    setQuestions: (state, action) => {
      state.questions = action.payload.map((q) => ({
        id: q.id,
        question: q.question,
        answer: null,
        feedback: null,
        score: null,
      }));
      state.currentIndex = 0;
      state.status = 'in-progress';
    },
    submitAnswer: (state, action) => {
      const idx = state.currentIndex;
      if (state.questions[idx]) {
        state.questions[idx].answer = action.payload;
      }
    },
    setAnswerFeedback: (state, action) => {
      const idx = state.currentIndex;
      if (state.questions[idx]) {
        state.questions[idx].feedback = action.payload.feedback;
        state.questions[idx].score = action.payload.score;
      }
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
      }
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setResults: (state, action) => {
      state.results = action.payload;
      state.status = 'completed';
      state.loading = false;
    },
    resetInterview: () => ({ ...initialState }),
  },
});

export const {
  setConfig,
  setQuestions,
  submitAnswer,
  setAnswerFeedback,
  nextQuestion,
  setTimeRemaining,
  setStatus,
  setLoading,
  setError,
  setResults,
  resetInterview,
} = interviewSlice.actions;
export default interviewSlice.reducer;
