import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  submitAnswer,
  setAnswerFeedback,
  nextQuestion,
  setStatus,
  setResults,
  setError,
  resetInterview,
  setTimeRemaining,
} from '../features/interview/interviewSlice.js';
import { evaluateInterviewAnswer, generatePerformanceAnalysis } from '../services/gemini.js';
import QuestionCard from '../components/QuestionCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Timer from '../components/Timer.jsx';
import Loader from '../components/Loader.jsx';

const INTERVIEW_TOTAL_MINUTES = 30;

const InterviewSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { config, questions, currentIndex, status, error, loading, timeRemaining } = useSelector((s) => s.interview);
  const [evaluating, setEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [timeUpNotice, setTimeUpNotice] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const endTimeRef = useRef(null);

  const finishInterview = useCallback(async () => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    dispatch(setStatus('evaluating'));
    try {
      const evaluatedQuestions = questions.filter((q) => q.score != null);
      const totalScore = evaluatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
      const maxScore = evaluatedQuestions.length * 10;
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      const perQuestion = questions.map((q) => ({
        question: q.question,
        answer: q.answer || '',
        feedback: q.feedback || '',
        score: q.score || 0,
      }));

      let analysis = { strengths: [], weaknesses: [], improvementSuggestions: [] };
      try {
        analysis = await generatePerformanceAnalysis({
          results: { config, perQuestion, percentage, totalScore, maxScore },
          type: 'interview',
        });
      } catch (_) {
        // non-fatal
      }

      dispatch(
        setResults({
          totalScore,
          maxScore,
          percentage,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          improvementSuggestions: analysis.improvementSuggestions,
          perQuestion,
        })
      );
      navigate('/interview/results');
    } catch (e) {
      dispatch(setError(e.message));
    }
  }, [questions, config, dispatch, navigate]);

  // Start timer ONCE when questions are loaded — never restart on re-renders
  useEffect(() => {
    if (!questions.length || status === 'idle') {
      if (status === 'idle') navigate('/interview/setup');
      return;
    }
    // Guard: only start the timer once per session
    if (timerRef.current) return;

    const totalSeconds = INTERVIEW_TOTAL_MINUTES * 60;
    endTimeRef.current = Date.now() + totalSeconds * 1000;
    dispatch(setTimeRemaining(totalSeconds));

    const tick = () => {
      const remainingMs = endTimeRef.current - Date.now();
      const remaining = Math.max(0, Math.round(remainingMs / 1000));
      dispatch(setTimeRemaining(remaining));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeUpNotice(true);
        dispatch(setStatus('time-up'));
        setTimeout(() => finishInterview(), 2500);
      }
    };

    // Run immediately, then every second
    tick();
    timerRef.current = setInterval(tick, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, status, dispatch, navigate]);

  // Shared tick function used by start/reset
  const startTick = (totalSeconds) => {
    endTimeRef.current = Date.now() + totalSeconds * 1000;
    dispatch(setTimeRemaining(totalSeconds));

    const tick = () => {
      const remainingMs = endTimeRef.current - Date.now();
      const remaining = Math.max(0, Math.round(remainingMs / 1000));
      dispatch(setTimeRemaining(remaining));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimerRunning(false);
        setTimeUpNotice(true);
        dispatch(setStatus('time-up'));
        setTimeout(() => finishInterview(), 2500);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    setTimerRunning(true);
  };

  const handleStart = () => {
    if (timerRef.current) {
      // Pause
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerRunning(false);
      return;
    }
    // Resume/Start — calculate remaining from current Redux state
    const remaining = timeRemaining > 0 ? timeRemaining : INTERVIEW_TOTAL_MINUTES * 60;
    startTick(remaining);
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTick(INTERVIEW_TOTAL_MINUTES * 60);
  };

  const handleQuit = () => {
    if (quitConfirm) {
      if (timerRef.current) clearInterval(timerRef.current);
      dispatch(resetInterview());
      navigate('/interview/setup');
    } else {
      setQuitConfirm(true);
      setTimeout(() => setQuitConfirm(false), 3000);
    }
  };

  if (!questions.length) return <Loader text="Loading interview..." />;

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = async (answer) => {
    if (!answer) return;
    dispatch(submitAnswer(answer));
    setEvaluating(true);
    setShowFeedback(true);
    try {
      const evalResult = await evaluateInterviewAnswer({
        question: current.question,
        answer,
        role: config.role,
        difficulty: config.difficulty,
      });
      dispatch(setAnswerFeedback({ score: evalResult.score, feedback: evalResult.feedback }));
    } catch (e) {
      dispatch(setError(e.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (isLast) {
      finishInterview();
    } else {
      dispatch(nextQuestion());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Time-up overlay */}
      {timeUpNotice && (
        <div className="mb-6 p-4 rounded-xl bg-warning/15 border border-warning/40 text-warning text-center font-semibold animate-pulse">
          ⏱ Time&apos;s up! Auto-submitting your answers...
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{config.role} Interview</h1>
          <p className="text-slate-400 text-sm capitalize">{config.difficulty} difficulty</p>
        </div>
        <div className="flex items-center gap-4">
          <Timer timeRemaining={timeRemaining} />
          <span className="badge bg-accent/20 text-accent-light text-sm">
            Q {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <ProgressBar current={currentIndex} total={questions.length} label="Progress" />
      </div>

      {/* Control buttons: Start/Pause, Reset & Quit */}
      <div className="mb-4 flex justify-end gap-3">
        <button
          onClick={handleStart}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            timerRunning
              ? 'border-warning bg-warning/15 text-warning hover:bg-warning/25'
              : 'border-success bg-success/15 text-success hover:bg-success/25'
          }`}
          title={timerRunning ? 'Pause the timer' : 'Start the timer'}
        >
          {timerRunning ? '⏸ Pause Timer' : '▶ Start Timer'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500 transition-all"
          title="Restart the interview timer"
        >
          ↻ Reset Timer
        </button>
        <button
          onClick={handleQuit}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            quitConfirm
              ? 'border-error bg-error/20 text-error'
              : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
          }`}
          title="Quit and discard this interview"
        >
          {quitConfirm ? 'Click again to confirm quit' : '✕ Quit Interview'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">{error}</div>
      )}

      {loading && <Loader text="Loading interview..." />}

      <QuestionCard
        question={current.question}
        number={currentIndex + 1}
        total={questions.length}
        onSubmit={handleAnswer}
        loading={evaluating}
        showFeedback={showFeedback && current.score != null}
        feedback={current.feedback}
        score={current.score}
        maxScore={10}
      />

      {showFeedback && current.score != null && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleNext} className="btn-primary" disabled={evaluating}>
            {isLast ? 'Finish & See Results' : 'Next Question →'}
          </button>
        </div>
      )}

      {evaluating && <Loader text="AI is evaluating your answer..." />}
    </div>
  );
};

export default InterviewSession;
