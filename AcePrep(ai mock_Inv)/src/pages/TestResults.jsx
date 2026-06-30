import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase.js';
import { resetTest } from '../features/test/testSlice.js';
import { addTest } from '../features/history/historySlice.js';
import ScoreRing from '../components/ScoreRing.jsx';
import { getScoreColor } from '../utils/helpers.js';

const TestResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { config, results } = useSelector((s) => s.test);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!results) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No results found.</p>
        <button onClick={() => navigate('/test/setup')} className="btn-primary mt-4">
          Start New Test
        </button>
      </div>
    );
  }

  const saveToHistory = async () => {
    if (!user || !isFirebaseConfigured || !db) return;
    setSaving(true);
    try {
      const docData = {
        domain: config.domain,
        paperType: config.paperType,
        duration: config.duration,
        totalQuestions: results.perQuestion.length,
        questions: results.perQuestion,
        totalScore: results.totalScore,
        maxScore: results.maxScore,
        percentage: results.percentage,
        correctCount: results.correctCount,
        incorrectCount: results.incorrectCount,
        unansweredCount: results.unansweredCount,
        analysis: results.analysis,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'users', user.uid, 'tests'), docData);
      dispatch(addTest({ id: ref.id, ...docData, createdAt: new Date().toISOString() }));

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { totalTests: increment(1) }).catch(() => {});
      setSaved(true);
    } catch (e) {
      console.error('Failed to save test:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    dispatch(resetTest());
    navigate('/test/setup');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Test Complete!</h1>
        <p className="text-slate-400">
          {config.domain} · <span className="capitalize">{config.paperType?.replace('-', ' ')}</span>
        </p>
      </div>

      <div className="card p-8 mb-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={results.totalScore} maxScore={results.maxScore} size={180} label="Score" />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className="text-2xl font-bold text-success">{results.correctCount}</div>
            <div className="text-xs text-slate-400 mt-1">Correct</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className="text-2xl font-bold text-error">{results.incorrectCount}</div>
            <div className="text-xs text-slate-400 mt-1">Incorrect</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className="text-2xl font-bold text-slate-300">{results.unansweredCount}</div>
            <div className="text-xs text-slate-400 mt-1">Unanswered</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className={`text-2xl font-bold ${getScoreColor(results.percentage)}`}>{results.percentage}%</div>
            <div className="text-xs text-slate-400 mt-1">Percentage</div>
          </div>
        </div>
      </div>

      {results.analysis && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🤖</span> AI Performance Analysis
          </h3>
          <p className="text-slate-300 leading-relaxed">{results.analysis}</p>
        </div>
      )}

      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Question Breakdown</h3>
        <div className="space-y-4">
          {results.perQuestion.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-background-surface border border-slate-700/50">
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className="text-sm font-medium text-slate-300 flex-1">
                  Q{i + 1}. {q.question}
                </span>
                <span
                  className={`badge ${
                    q.score > 0 ? 'bg-success/20 text-success' : q.score === 0 && q.userAnswer ? 'bg-error/20 text-error' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {q.score}/{q.maxScore}
                </span>
              </div>
              {q.options && (
                <div className="text-xs text-slate-500 mb-1">
                  Options: {q.options.join(' · ')}
                </div>
              )}
              <p className="text-sm text-slate-400">
                <span className="text-slate-500">Your answer:</span>{' '}
                <span className={q.score > 0 ? 'text-success' : 'text-error'}>{q.userAnswer || '—'}</span>
              </p>
              {q.correctAnswer && q.score === 0 && (
                <p className="text-sm text-success">
                  <span className="text-slate-500">Correct:</span> {q.correctAnswer}
                </p>
              )}
              {q.feedback && (
                <p className="text-sm text-accent-light/80 italic mt-1">💬 {q.feedback}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={saveToHistory} className="btn-primary" disabled={saving || saved}>
          {saved ? '✓ Saved to History' : saving ? 'Saving...' : 'Save to History'}
        </button>
        <button onClick={handleNew} className="btn-secondary">
          New Test
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost">
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default TestResults;
