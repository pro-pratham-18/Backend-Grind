const Timer = ({ timeRemaining, size = 'md' }) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const pad = (n) => String(n).padStart(2, '0');

  let colorClass = 'text-success';
  if (timeRemaining <= 60) colorClass = 'text-error';
  else if (timeRemaining <= 300) colorClass = 'text-warning';

  const sizeClass = size === 'lg' ? 'text-4xl sm:text-5xl' : size === 'sm' ? 'text-lg' : 'text-2xl sm:text-3xl';

  return (
    <div className={`flex items-center gap-2 font-mono font-bold ${sizeClass} ${colorClass}`}>
      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {hours > 0 ? `${pad(hours)}:` : ''}
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
};

export default Timer;
