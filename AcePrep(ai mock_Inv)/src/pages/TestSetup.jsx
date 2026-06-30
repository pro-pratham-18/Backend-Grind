import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PAPER_TYPES, DURATIONS, TEST_QUESTION_COUNTS } from '../utils/constants.js';
import { setConfig, setQuestions, setLoading, setError, setStatus } from '../features/test/testSlice.js';
import { generateTestQuestions } from '../services/gemini.js';
import DomainSelector from '../components/DomainSelector.jsx';
import Loader from '../components/Loader.jsx';

const TestSetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.test);
  const [domain, setDomain] = useState('');
  const [paperType, setPaperType] = useState('mcq');
  const [duration, setDuration] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [localError, setLocalError] = useState('');

  const handleStart = async () => {
    setLocalError('');
    if (!domain) {
      setLocalError('Please select a domain.');
      return;
    }
    dispatch(setConfig({ domain, paperType, duration, totalQuestions }));
    dispatch(setLoading(true));
    dispatch(setStatus('setting-up'));
    try {
      const questions = await generateTestQuestions({ domain, paperType, count: totalQuestions });
      dispatch(setQuestions(questions));
      navigate('/test/session');
    } catch (e) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Setup Test</h1>
        <p className="text-slate-400 mt-2">Choose your domain, format, and duration. The timer starts when the test begins.</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <label className="label">Domain</label>
          <DomainSelector value={domain} onChange={setDomain} />
        </div>

        <div>
          <label className="label">Paper Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PAPER_TYPES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPaperType(p.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paperType === p.id
                    ? 'border-accent bg-accent/15'
                    : 'border-slate-700 bg-background-surface hover:border-slate-500'
                }`}
              >
                <div className={`font-semibold mb-1 ${paperType === p.id ? 'text-accent-light' : 'text-white'}`}>
                  {p.label}
                </div>
                <div className="text-xs text-slate-400">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Duration</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  duration === d.value
                    ? 'border-accent bg-accent/15 text-accent-light'
                    : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Number of Questions</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEST_QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setTotalQuestions(n)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  totalQuestions === n
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

        {loading && <Loader text="Generating test..." />}

        <button onClick={handleStart} className="btn-primary w-full text-lg py-3.5" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Test & Start'}
        </button>
      </div>
    </div>
  );
};

export default TestSetup;
