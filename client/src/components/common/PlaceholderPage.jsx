import React from 'react';

const PlaceholderPage = ({ title, description, phase }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      <div className="max-w-md">
        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 uppercase">
          {phase}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-3">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
          Module interface ready. Full business logic and interactive views will be implemented in this phase.
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
