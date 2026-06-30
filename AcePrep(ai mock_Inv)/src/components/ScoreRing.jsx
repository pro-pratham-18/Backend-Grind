import { getScoreRingColor } from '../utils/helpers.js';

const ScoreRing = ({ score, maxScore, size = 160, strokeWidth = 12, label }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getScoreRingColor(percentage);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
          <span className="text-xs text-slate-400">
            {score}/{maxScore}
          </span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </div>
  );
};

export default ScoreRing;
