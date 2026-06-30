import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase.js';
import { setInterviews, setTests, setLoading, setError } from '../features/history/historySlice.js';
import { formatDate, calculatePercentage } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { interviews, tests, loading } = useSelector((s) => s.history);

  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) return;
    const fetchHistory = async () => {
      dispatch(setLoading(true));
      try {
        const iSnap = await getDocs(
          query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'), limit(50))
        );
        const iData = iSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        dispatch(setInterviews(iData));

        const tSnap = await getDocs(
          query(collection(db, 'users', user.uid, 'tests'), orderBy('createdAt', 'desc'), limit(50))
        );
        const tData = tSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        dispatch(setTests(tData));
      } catch (e) {
        dispatch(setError(e.message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchHistory();
  }, [user, dispatch]);

  const totalInterviews = interviews.length;
  const totalTests = tests.length;
  const allPercentages = [
    ...interviews.map((i) => i.percentage),
    ...tests.map((t) => t.percentage),
  ].filter((p) => typeof p === 'number');
  const avgScore = allPercentages.length > 0 ? Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length) : 0;
  const bestScore = allPercentages.length > 0 ? Math.max(...allPercentages) : 0;

  const recent = [
    ...interviews.map((i) => ({ ...i, type: 'interview', label: i.role, date: i.createdAt })),
    ...tests.map((t) => ({ ...t, type: 'test', label: t.domain, date: t.createdAt })),
  ]
    .sort((a, b) => {
      const ta = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
      const tb = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
      return tb - ta;
    })
    .slice(0, 5);

  const stats = [
    { label: 'Total Interviews', value: totalInterviews, color: 'text-accent-light' },
    { label: 'Total Tests', value: totalTests, color: 'text-purple-400' },
    { label: 'Average Score', value: `${avgScore}%`, color: 'text-success' },
    { label: 'Best Score', value: `${bestScore}%`, color: 'text-warning' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-accent-light">{user?.displayName || 'User'}</span>
        </h1>
        <p className="text-slate-400 mt-1">Here's your preparation overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-sm text-slate-400 mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Link to="/interview/setup" className="card p-6 hover:border-accent/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Start Mock Interview</h3>
              <p className="text-sm text-slate-400">AI-generated questions with real-time evaluation</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎙️
            </div>
          </div>
        </Link>
        <Link to="/test/setup" className="card p-6 hover:border-accent/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Take a Test</h3>
              <p className="text-sm text-slate-400">Timed domain tests in MCQ, one-word, or long-answer</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ⏱️
            </div>
          </div>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Link to="/history" className="text-sm text-accent-light hover:underline">View all</Link>
        </div>
        {loading ? (
          <Loader size="sm" text="Loading activity..." />
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-3">No activity yet. Start your first session!</p>
            <div className="flex gap-3 justify-center">
              <Link to="/interview/setup" className="btn-primary text-sm">Start Interview</Link>
              <Link to="/test/setup" className="btn-secondary text-sm">Take Test</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background-surface">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${
                    item.type === 'interview' ? 'bg-accent/20' : 'bg-purple-500/20'
                  }`}>
                    {item.type === 'interview' ? '🎙️' : '📝'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {item.type === 'interview' ? item.difficulty : item.paperType?.replace('-', ' ')} · {formatDate(item.date)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-white">{item.percentage ?? 0}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
