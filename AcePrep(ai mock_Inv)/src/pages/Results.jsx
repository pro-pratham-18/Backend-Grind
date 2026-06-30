import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase.js';
import { resetInterview } from '../features/interview/interviewSlice.js';
import { addInterview } from '../features/history/historySlice.js';
import ScoreRing from '../components/ScoreRing.jsx';
import { getScoreColor } from '../utils/helpers.js';

const Results = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { config, results } = useSelector((s) => s.interview);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!results) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No results found.</p>
        <button onClick={() => navigate('/interview/setup')} className="btn-primary mt-4">
          Start New Interview
        </button>
      </div>
    );
  }

  const saveToHistory = async () => {
    if (!user || !isFirebaseConfigured || !db) return;
    setSaving(true);
    try {
      const docData = {
        role: config.role,
        difficulty: config.difficulty,
        questionCount: results.perQuestion.length,
        questions: results.perQuestion,
        totalScore: results.totalScore,
        maxScore: results.maxScore,
        percentage: results.percentage,
        strengths: results.strengths,
        weaknesses: results.weaknesses,
        improvementSuggestions: results.improvementSuggestions,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'users', user.uid, 'interviews'), docData);
      dispatch(addInterview({ id: ref.id, ...docData, createdAt: new Date().toISOString() }));

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { totalInterviews: increment(1) }).catch(() => {});
      setSaved(true);
    } catch (e) {
      console.error('Failed to save interview:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    dispatch(resetInterview());
    navigate('/interview/setup');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Interview Complete!</h1>
        <p className="text-slate-400">
          {config.role} · <span className="capitalize">{config.difficulty}</span>
        </p>
      </div>

      <div className="card p-8 mb-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={results.totalScore} maxScore={results.maxScore} size={180} label="Overall Score" />
        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className="text-2xl font-bold text-white">{results.totalScore}</div>
            <div className="text-xs text-slate-400 mt-1">Total Score</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className="text-2xl font-bold text-white">{results.perQuestion.length}</div>
            <div className="text-xs text-slate-400 mt-1">Questions</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background-surface">
            <div className={`text-2xl font-bold ${getScoreColor(results.percentage)}`}>{results.percentage}%</div>
            <div className="text-xs text-slate-400 mt-1">Percentage</div>
          </div>
        </div>
      </div>

      {(results.strengths?.length || results.weaknesses?.length || results.improvementSuggestions?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {results.strengths?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-success font-semibold mb-3 flex items-center gap-2">
                <span>✓</span> Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-success">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.weaknesses?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-warning font-semibold mb-3 flex items-center gap-2">
                <span>!</span> Weaknesses
              </h3>
              <ul className="space-y-2">
                {results.weaknesses.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-warning">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.improvementSuggestions?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-accent-light font-semibold mb-3 flex items-center gap-2">
                <span>→</span> Suggestions
              </h3>
              <ul className="space-y-2">
                {results.improvementSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-accent-light">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Question Breakdown</h3>
        <div className="space-y-4">
          {results.perQuestion.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-background-surface border border-slate-700/50">
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className="text-sm font-medium text-slate-300">
                  Q{i + 1}. {q.question}
                </span>
                <span className={`badge ${getScoreColor((q.score / 10) * 100) === 'text-success' ? 'bg-success/20 text-success' : getScoreColor((q.score / 10) * 100) === 'text-warning' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'}`}>
                  {q.score}/10
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                <span className="text-slate-500">Your answer:</span> {q.answer || '—'}
              </p>
              {q.feedback && (
                <p className="text-sm text-accent-light/80 italic">💬 {q.feedback}</p>
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
          New Interview
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost">
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
