import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  submitAnswer,
  setAnswerResult,
  nextQuestion,
  setStatus,
  setResults,
  setError,
  setTimeRemaining,
  resetTest,
} from '../features/test/testSlice.js';
import { evaluateTestAnswer, generatePerformanceAnalysis } from '../services/gemini.js';
import QuestionCard from '../components/QuestionCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Timer from '../components/Timer.jsx';
import Loader from '../components/Loader.jsx';

const TestSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { config, questions, currentIndex, status, error, loading, timeRemaining } = useSelector((s) => s.test);
  const [evaluating, setEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [timeUpNotice, setTimeUpNotice] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const endTimeRef = useRef(null);

  const totalSeconds = (config.duration || 0) * 60;

  const finishTest = useCallback(async () => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    dispatch(setStatus('evaluating'));
    try {
      const evaluated = questions.filter((q) => q.score != null);
      const totalScore = evaluated.reduce((sum, q) => sum + (q.score || 0), 0);
      const maxScore = questions.reduce((sum, q) => sum + (q.maxScore || 0), 0);
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const correctCount = evaluated.filter((q) => q.score > 0).length;
      const incorrectCount = evaluated.filter((q) => q.score === 0).length;
      const unansweredCount = questions.length - evaluated.length;

      const perQuestion = questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer || '',
        userAnswer: q.userAnswer || '',
        score: q.score ?? 0,
        maxScore: q.maxScore || 0,
        feedback: q.feedback || '',
      }));

      let analysis = 'Great effort! Review the questions above to identify areas for improvement.';
      try {
        const result = await generatePerformanceAnalysis({
          results: { config, perQuestion, percentage, totalScore, maxScore, correctCount, incorrectCount },
          type: 'test',
        });
        analysis = [...(result.strengths || []), ...(result.weaknesses || []), ...(result.improvementSuggestions || [])].join(' ');
        if (!analysis) analysis = 'Review the questions above to identify areas for improvement.';
      } catch (_) {
        // non-fatal
      }

      dispatch(
        setResults({
          totalScore,
          maxScore,
          percentage,
          correctCount,
          incorrectCount,
          unansweredCount,
          perQuestion,
          analysis,
        })
      );
      navigate('/test/results');
    } catch (e) {
      dispatch(setError(e.message));
    }
  }, [questions, config, dispatch, navigate]);

  // Start timer ONCE when questions are loaded — never restart on re-renders
  useEffect(() => {
    if (!questions.length || status === 'idle') {
      if (status === 'idle') navigate('/test/setup');
      return;
    }
    if (totalSeconds <= 0) {
      dispatch(setError('Invalid test duration. Please set up the test again.'));
      navigate('/test/setup');
      return;
    }
    // Guard: only start the timer once per session
    if (timerRef.current) return;

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
        setTimeout(() => finishTest(), 2500);
      }
    };

    // Run immediately, then every second
    tick();
    timerRef.current = setInterval(tick, 1000);
    setTimerRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, status, totalSeconds, dispatch, navigate]);

  // Shared tick function used by start/reset
  const startTick = (seconds) => {
    endTimeRef.current = Date.now() + seconds * 1000;
    dispatch(setTimeRemaining(seconds));

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
        setTimeout(() => finishTest(), 2500);
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
    const remaining = timeRemaining > 0 ? timeRemaining : totalSeconds;
    startTick(remaining);
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTick(totalSeconds);
  };

  const handleQuit = () => {
    if (quitConfirm) {
      if (timerRef.current) clearInterval(timerRef.current);
      dispatch(resetTest());
      navigate('/test/setup');
    } else {
      setQuitConfirm(true);
      setTimeout(() => setQuitConfirm(false), 3000);
    }
  };

  if (!questions.length) return <Loader text="Loading test..." />;

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = async (answer) => {
    if (!answer) return;
    dispatch(submitAnswer(answer));
    setEvaluating(true);
    setShowFeedback(true);
    try {
      const result = await evaluateTestAnswer({
        question: current.question,
        userAnswer: answer,
        correctAnswer: current.correctAnswer,
        paperType: config.paperType,
      });
      dispatch(
        setAnswerResult({
          score: result.score,
          maxScore: result.maxScore,
          feedback: result.feedback,
          correctAnswer: result.correctAnswer,
        })
      );
    } catch (e) {
      dispatch(setError(e.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (isLast) {
      finishTest();
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
          <h1 className="text-2xl font-bold text-white">{domainLabel(config.domain)}</h1>
          <p className="text-slate-400 text-sm capitalize">{config.paperType?.replace('-', ' ')} · {config.duration} min</p>
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
          title="Restart the test timer"
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
          title="Quit and discard this test"
        >
          {quitConfirm ? 'Click again to confirm quit' : '✕ Quit Test'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">{error}</div>
      )}

      {loading && <Loader text="Loading test..." />}

      <QuestionCard
        question={current.question}
        number={currentIndex + 1}
        total={questions.length}
        options={current.options}
        paperType={config.paperType}
        onSubmit={handleAnswer}
        loading={evaluating}
        showFeedback={showFeedback && current.score != null}
        feedback={current.feedback}
        score={current.score}
        maxScore={current.maxScore}
      />

      {showFeedback && current.score != null && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleNext} className="btn-primary" disabled={evaluating}>
            {isLast ? 'Finish Test' : 'Next Question →'}
          </button>
        </div>
      )}

      {evaluating && <Loader text="AI is evaluating your answer..." />}
    </div>
  );
};

const domainLabel = (d) => d || 'Test';

export default TestSession;
