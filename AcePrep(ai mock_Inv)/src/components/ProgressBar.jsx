const ProgressBar = ({ current, total, label }) => {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div>
      {label && <div className="text-xs text-slate-400 mb-1.5 font-medium">{label}</div>}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1.5">
        <span>
          {current + 1} of {total}
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
