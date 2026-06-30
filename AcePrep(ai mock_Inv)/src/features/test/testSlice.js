import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: {
    domain: null,
    paperType: null,
    duration: null,
    totalQuestions: null,
  },
  questions: [],
  currentIndex: 0,
  status: 'idle',
  timeRemaining: 0,
  loading: false,
  error: null,
  results: null,
};

const testSlice = createSlice({
  name: 'test',
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
        options: q.options || null,
        correctAnswer: q.correctAnswer || null,
        userAnswer: null,
        score: null,
        maxScore: q.maxScore || (q.options ? 1 : q.correctAnswer ? 1 : 10),
        feedback: null,
      }));
      state.currentIndex = 0;
      state.timeRemaining = (state.config.duration || 0) * 60;
      state.status = 'in-progress';
    },
    submitAnswer: (state, action) => {
      const idx = state.currentIndex;
      if (state.questions[idx]) {
        state.questions[idx].userAnswer = action.payload;
      }
    },
    setAnswerResult: (state, action) => {
      const idx = state.currentIndex;
      if (state.questions[idx]) {
        state.questions[idx].score = action.payload.score;
        state.questions[idx].maxScore = action.payload.maxScore;
        state.questions[idx].feedback = action.payload.feedback;
        if (action.payload.correctAnswer) {
          state.questions[idx].correctAnswer = action.payload.correctAnswer;
        }
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
    resetTest: () => ({ ...initialState }),
  },
});

export const {
  setConfig,
  setQuestions,
  submitAnswer,
  setAnswerResult,
  nextQuestion,
  setTimeRemaining,
  setStatus,
  setLoading,
  setError,
  setResults,
  resetTest,
} = testSlice.actions;
export default testSlice.reducer;
