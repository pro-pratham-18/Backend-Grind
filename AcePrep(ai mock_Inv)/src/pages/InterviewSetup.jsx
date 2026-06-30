import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ROLES, DIFFICULTIES, INTERVIEW_QUESTION_COUNTS } from '../utils/constants.js';
import { setConfig, setQuestions, setLoading, setError, setStatus } from '../features/interview/interviewSlice.js';
import { generateInterviewQuestions } from '../services/gemini.js';
import Loader from '../components/Loader.jsx';

const InterviewSetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.interview);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [localError, setLocalError] = useState('');

  const finalRole = role === 'Other' ? customRole.trim() : role;

  const handleStart = async () => {
    setLocalError('');
    if (!finalRole) {
      setLocalError('Please select or enter a role.');
      return;
    }
    dispatch(setConfig({ role: finalRole, difficulty, questionCount }));
    dispatch(setLoading(true));
    dispatch(setStatus('setting-up'));
    try {
      const questions = await generateInterviewQuestions({ role: finalRole, difficulty, count: questionCount });
      dispatch(setQuestions(questions));
      navigate('/interview/session');
    } catch (e) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Setup Mock Interview</h1>
        <p className="text-slate-400 mt-2">Configure your interview and let AI generate tailored questions.</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <label className="label">Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  role === r
                    ? 'border-accent bg-accent/15 text-accent-light'
                    : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
                }`}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => setRole('Other')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                role === 'Other'
                  ? 'border-accent bg-accent/15 text-accent-light'
                  : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
              }`}
            >
              Other
            </button>
          </div>
          {role === 'Other' && (
            <input
              type="text"
              className="input-field"
              placeholder="Enter custom role (e.g. Embedded Systems Engineer)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
          )}
        </div>

        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border capitalize transition-all ${
                  difficulty === d
                    ? 'border-accent bg-accent/15 text-accent-light'
                    : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Number of Questions</label>
          <div className="flex gap-3">
            {INTERVIEW_QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  questionCount === n
                    ? 'border-accent bg-accent/15 text-accent-light'
                    : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {localError && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">{localError}</div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">{error}</div>
        )}

        {loading && <Loader text="Generating questions..." />}

        <button onClick={handleStart} className="btn-primary w-full text-lg py-3.5" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Questions & Start'}
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;
