import React from 'react';

const colorStyles = {
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-600',
  indigo: 'bg-indigo-600',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-600',
};

const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'blue',
  height = 'h-2',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const barColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span className="font-medium">Progress</span>
          <span className="font-semibold text-slate-800">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
