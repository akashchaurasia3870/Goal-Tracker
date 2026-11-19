import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Target, Milestone, CheckSquare, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { sampleGoals } from '../../data/goal_data';
import { sampleTasks } from '../../data/task_data';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'goals', 'milestones', 'tasks'
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten searchable items
  const allGoals = sampleGoals.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: `${g.category} · Priority: ${g.priority}`,
    type: 'goal',
    path: '/goals',
    icon: Target,
    color: 'text-blue-600 bg-blue-50',
  }));

  const allMilestones = sampleGoals.flatMap((g) =>
    (g.milestones || []).map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: `Goal: ${g.title} · ${m.status}`,
      type: 'milestone',
      path: '/milestones',
      icon: Milestone,
      color: 'text-indigo-600 bg-indigo-50',
    }))
  );

  const allTasksList = sampleTasks.map((t) => ({
    id: t.id,
    title: t.title,
    subtitle: `${t.category} · Priority: ${t.priority} · Status: ${t.status}`,
    type: 'task',
    path: '/tasks',
    icon: CheckSquare,
    color: 'text-emerald-600 bg-emerald-50',
  }));

  const combinedItems = [...allGoals, ...allMilestones, ...allTasksList];

  const filteredItems = combinedItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search goals, milestones, or tasks... (ESC to close)"
              className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder-slate-400 text-slate-800"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs">
            {['all', 'goal', 'milestone', 'task'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'all' ? 'All Types' : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No matching results found for "<span className="font-semibold text-slate-700">{query}</span>"
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition shrink-0 pl-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider">{item.type}</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Hints */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Navigation: Click to jump</span>
            <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
