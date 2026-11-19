import React from 'react';

const priorityStyles = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-red-50 text-red-700 border-red-200 font-semibold',
};

const statusStyles = {
  'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Todo: 'bg-slate-100 text-slate-700 border-slate-200',
};

const Badge = ({
  children,
  priority,
  status,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (priority && priorityStyles[priority]) {
    style = priorityStyles[priority];
  } else if (status && statusStyles[status]) {
    style = statusStyles[status];
  } else {
    switch (variant) {
      case 'blue':
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'emerald':
      case 'green':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'amber':
      case 'yellow':
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'red':
      case 'rose':
        style = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'purple':
        style = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'indigo':
        style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      default:
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  }

  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${style} ${sizeClass} ${className}`}
    >
      {children || priority || status}
    </span>
  );
};

export default Badge;
