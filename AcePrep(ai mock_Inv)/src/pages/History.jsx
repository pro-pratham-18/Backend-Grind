import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase.js';
import { setInterviews, setTests, setLoading } from '../features/history/historySlice.js';
import { formatDate, getScoreColor } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';

const History = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { interviews, tests, loading } = useSelector((s) => s.history);
  const [tab, setTab] = useState('interviews');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) return;
    const fetchAll = async () => {
      dispatch(setLoading(true));
      try {
        const iSnap = await getDocs(
          query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'), limit(100))
        );
        dispatch(setInterviews(iSnap.docs.map((d) => ({ id: d.id, ...d.data() }))));

        const tSnap = await getDocs(
          query(collection(db, 'users', user.uid, 'tests'), orderBy('createdAt', 'desc'), limit(100))
        );
        dispatch(setTests(tSnap.docs.map((d) => ({ id: d.id, ...d.data() }))));
      } catch (e) {
        console.error(e);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchAll();
  }, [user, dispatch]);

  const data = tab === 'interviews' ? interviews : tests;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">History</h1>
        <p className="text-slate-400 mt-1">Review your past interviews and tests.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('interviews')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'interviews' ? 'bg-accent text-white' : 'bg-background-surface text-slate-300 hover:bg-slate-700'
          }`}
        >
          Interviews ({interviews.length})
        </button>
        <button
          onClick={() => setTab('tests')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'tests' ? 'bg-accent text-white' : 'bg-background-surface text-slate-300 hover:bg-slate-700'
          }`}
        >
          Tests ({tests.length})
        </button>
      </div>

      {loading ? (
        <Loader text="Loading history..." />
      ) : data.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400">No {tab} recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${
                      tab === 'interviews' ? 'bg-accent/20' : 'bg-purple-500/20'
                    }`}>
                      {tab === 'interviews' ? '🎙️' : '📝'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {tab === 'interviews' ? item.role : item.domain}
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {tab === 'interviews'
                          ? `${item.difficulty} · ${item.questionCount} questions`
                          : `${item.paperType?.replace('-', ' ')} · ${item.duration} min · ${item.totalQuestions} questions`}
                        {' · '}{formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-bold ${getScoreColor(item.percentage ?? 0)}`}>
                      {item.percentage ?? 0}%
                    </div>
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-700/50 p-5 animate-fade-in">
                    {tab === 'interviews' && item.strengths?.length > 0 && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-success mb-2">Strengths</div>
                          <ul className="space-y-1">
                            {item.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-warning mb-2">Weaknesses</div>
                          <ul className="space-y-1">
                            {item.weaknesses?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-accent-light mb-2">Suggestions</div>
                          <ul className="space-y-1">
                            {item.improvementSuggestions?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {tab === 'tests' && (
                      <div className="mb-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-xl bg-background-surface">
                          <div className="text-lg font-bold text-success">{item.correctCount}</div>
                          <div className="text-xs text-slate-400">Correct</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background-surface">
                          <div className="text-lg font-bold text-error">{item.incorrectCount}</div>
                          <div className="text-xs text-slate-400">Incorrect</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background-surface">
                          <div className="text-lg font-bold text-slate-300">{item.unansweredCount}</div>
                          <div className="text-xs text-slate-400">Unanswered</div>
                        </div>
                      </div>
                    )}
                    {item.analysis && (
                      <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 mb-4">
                        <div className="text-xs font-semibold text-accent-light mb-1">AI Analysis</div>
                        <p className="text-sm text-slate-300">{item.analysis}</p>
                      </div>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(item.questions || []).slice(0, 10).map((q, i) => (
                        <div key={i} className="p-3 rounded-xl bg-background-surface text-sm">
                          <div className="text-slate-300 mb-1">
                            <span className="text-slate-500">Q{i + 1}.</span> {q.question}
                          </div>
                          <div className="text-xs text-slate-400">
                            Answer: <span className="text-slate-200">{q.answer || q.userAnswer || '—'}</span>
                            {' · '}
                            Score: <span className={q.score > 0 ? 'text-success' : 'text-error'}>{q.score}/{q.maxScore ?? 10}</span>
                          </div>
                        </div>
                      ))}
                      {(item.questions || []).length > 10 && (
                        <p className="text-xs text-slate-500 text-center">+ {(item.questions || []).length - 10} more questions</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
