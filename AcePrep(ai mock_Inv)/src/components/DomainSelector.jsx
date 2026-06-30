import { DOMAINS } from '../utils/constants.js';

const DomainSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {DOMAINS.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
            value === d
              ? 'border-accent bg-accent/15 text-accent-light'
              : 'border-slate-700 bg-background-surface text-slate-300 hover:border-slate-500'
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
};

export default DomainSelector;
