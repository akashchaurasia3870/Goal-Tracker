import React, { useEffect, useState } from 'react';
import { Target, Milestone, CheckSquare, Clock, ArrowRight, ShieldCheck, Database, Server } from 'lucide-react';
import api from '../../services/api';
import { sampleGoals } from '../../data/goal_data';
import { sampleTasks } from '../../data/task_data';

const DashboardPage = () => {
  const [serverStatus, setServerStatus] = useState({ loading: true, status: 'checking', message: '' });

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        setServerStatus({
          loading: false,
          status: res.data?.status || 'healthy',
          database: res.data?.database || 'disconnected',
          message: res.message || 'Server is reachable',
        });
      })
      .catch((err) => {
        setServerStatus({
          loading: false,
          status: 'offline',
          database: 'disconnected',
          message: 'Backend server is not running or unreachable at port 5000',
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">TaskFlow Workspace</h2>
          <p className="text-sm text-slate-500 mt-1">
            Phase 1 Foundation: Separate React & Express Architecture with MongoDB
          </p>
        </div>

        {/* Server & Database Health Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            serverStatus.status === 'healthy' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <Server className="w-3.5 h-3.5" />
            <span>API: {serverStatus.loading ? 'Checking...' : serverStatus.status}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            serverStatus.database === 'connected' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB: {serverStatus.database || 'disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Goals</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{sampleGoals.length}</p>
          <p className="text-xs text-slate-500 mt-1">Structured top-level objectives</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Milestones</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Milestone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">4</p>
          <p className="text-xs text-slate-500 mt-1">Divided achievable stages</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tasks</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{sampleTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Goal-tied & independent tasks</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Architecture Status</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">Phase 1</p>
          <p className="text-xs text-slate-500 mt-1">Foundation Ready</p>
        </div>
      </div>

      {/* Goal Hierarchy Showcase Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Core Hierarchy Blueprint</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Goal &rarr; Milestones &rarr; Tasks + Independent Tasks support
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">1. Goal Level</span>
            <h4 className="font-semibold text-slate-800 text-sm mt-1">Learn MySQL</h4>
            <p className="text-xs text-slate-600 mt-1">Overall objective with category, priority, start & target date.</p>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">2. Milestone Level</span>
            <h4 className="font-semibold text-slate-800 text-sm mt-1">SQL Basics &rarr; CRUD &rarr; Joins</h4>
            <p className="text-xs text-slate-600 mt-1">Stages with custom rewards and auto-completion when all tasks finish.</p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">3. Task Level</span>
            <h4 className="font-semibold text-slate-800 text-sm mt-1">Learn SELECT · Solve Problems</h4>
            <p className="text-xs text-slate-600 mt-1">Actionable tasks (or independent daily/recurring tasks without goals).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
