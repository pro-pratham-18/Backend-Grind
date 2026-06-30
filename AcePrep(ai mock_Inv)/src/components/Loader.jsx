const sizeMap = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
};

const Loader = ({ size = 'md', text = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeMap[size]} rounded-full border-accent/30 border-t-accent animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
};

export default Loader;
