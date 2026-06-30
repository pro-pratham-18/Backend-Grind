import { useState } from 'react';

const QuestionCard = ({ question, number, total, options, paperType, onSubmit, loading, showFeedback, feedback, score, maxScore }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (!answer || loading) return;
    onSubmit(answer);
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="badge bg-accent/20 text-accent-light">
          Question {number}/{total}
        </span>
        {showFeedback && score != null && (
          <span className={`badge ${score > 0 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            Score: {score}/{maxScore}
          </span>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-6">
        {question}
      </h2>

      {options && options.length > 0 ? (
        <div className="space-y-3">
          {options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                answer === opt
                  ? 'border-accent bg-accent/10'
                  : 'border-slate-700 hover:border-slate-500 bg-background-surface'
              }`}
            >
              <input
                type="radio"
                name="option"
                value={opt}
                checked={answer === opt}
                onChange={() => setAnswer(opt)}
                className="mt-1 accent-accent"
              />
              <span className="text-slate-200">{opt}</span>
            </label>
          ))}
        </div>
      ) : paperType === 'long-answer' ? (
        <textarea
          className="input-field min-h-[180px] resize-y"
          placeholder="Type your detailed answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showFeedback}
        />
      ) : (
        <input
          type="text"
          className="input-field"
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showFeedback}
          onKeyDown={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
        />
      )}

      {showFeedback && feedback && (
        <div className={`mt-5 p-4 rounded-xl border ${
          score > 0 ? 'bg-success/5 border-success/30' : 'bg-warning/5 border-warning/30'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">AI Feedback</div>
          <p className="text-slate-200 text-sm leading-relaxed">{feedback}</p>
        </div>
      )}

      {!showFeedback && (
        <div className="mt-6 flex justify-end">
          <button onClick={handleSubmit} className="btn-primary" disabled={loading || !answer}>
            {loading ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
