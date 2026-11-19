import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Users,
  Target,
  CheckSquare,
  Activity,
  Server,
  Cpu,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  ShieldCheck,
  Shield,
  Clock,
  Calendar,
  AlertCircle,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/admin.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const AdminPage = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'logs'
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Logs State
  const [logs, setLogs] = useState([]);
  const [logPagination, setLogPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [logEntityFilter, setLogEntityFilter] = useState('');

  // Action Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    action: null, // 'status' | 'role'
    targetUser: null,
    nextValue: null,
    loading: false,
  });

  // Fetch System Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load admin stats:', err);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      const data = await adminService.getUsers({
        page,
        limit: 10,
        search: userSearch,
        role: userRoleFilter || undefined,
        isActive: userStatusFilter !== '' ? userStatusFilter : undefined,
      });
      setUsers(data.users || []);
      setUserPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.warn('Failed to load user directory:', err);
      toast.error('Unable to fetch user directory');
    }
  }, [userSearch, userRoleFilter, userStatusFilter]);

  // Fetch Activity Logs
  const fetchLogs = useCallback(async (page = 1) => {
    try {
      const data = await adminService.getActivityLogs({
        page,
        limit: 15,
        entityType: logEntityFilter || undefined,
      });
      setLogs(data.logs || []);
      setLogPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    }
  }, [logEntityFilter]);

  // Initial Load
  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(1), fetchLogs(1)]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchLogs]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Search/Filter triggers for Users
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Filter triggers for Logs
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Open confirmation dialog for user status toggle
  const handleToggleStatus = (targetUser) => {
    if (targetUser._id === currentAdmin?._id) {
      toast.error('You cannot deactivate your own account.');
      return;
    }
    setDialogState({
      isOpen: true,
      action: 'status',
      targetUser,
      nextValue: !targetUser.isActive,
      loading: false,
    });
  };

  // Open confirmation dialog for role update
  const handleToggleRole = (targetUser) => {
    if (targetUser._id === currentAdmin?._id) {
      toast.error('You cannot change your own administrative role.');
      return;
    }
    const nextRole = targetUser.role === 'Admin' ? 'User' : 'Admin';
    setDialogState({
      isOpen: true,
      action: 'role',
      targetUser,
      nextValue: nextRole,
      loading: false,
    });
  };

  // Execute confirmed dialog action
  const handleConfirmAction = async () => {
    const { action, targetUser, nextValue } = dialogState;
    if (!targetUser) return;

    setDialogState((prev) => ({ ...prev, loading: true }));
    try {
      if (action === 'status') {
        await adminService.updateUserStatus(targetUser._id, nextValue);
        toast.success(`User ${targetUser.name} has been ${nextValue ? 'activated' : 'deactivated'}.`);
      } else if (action === 'role') {
        await adminService.updateUserRole(targetUser._id, nextValue);
        toast.success(`Role for ${targetUser.name} updated to ${nextValue}.`);
      }

      setDialogState({ isOpen: false, action: null, targetUser: null, nextValue: null, loading: false });
      // Refresh directory and stats
      fetchUsers(userPagination.page);
      fetchStats();
      fetchLogs(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(msg);
      setDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Platform Administration</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              Super Admin Area
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            System health monitoring, user account directory, privilege controls, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshAll}
            loading={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
          {stats?.users?.total !== undefined && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {stats.users.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Global Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.users?.total ?? 0}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">{stats?.users?.active ?? 0} active</span>
                <span>•</span>
                <span>{stats?.users?.admins ?? 0} admins</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-indigo-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Goals</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.goals?.total ?? 0}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">{stats?.goals?.completed ?? 0} completed</span>
                <span>•</span>
                <span>{stats?.milestones?.total ?? 0} milestones</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.tasks?.total ?? 0}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">{stats?.tasks?.completed ?? 0} completed</span>
                <span>•</span>
                <span>{stats?.tasks?.recurringCount ?? 0} recurring</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-purple-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.tasks?.completionRate ?? 0}%</p>
              <div className="mt-2">
                <ProgressBar progress={stats?.tasks?.completionRate ?? 0} height="h-2" color="bg-purple-600" />
              </div>
            </Card>
          </div>

          {/* Infrastructure Health Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-indigo-600" />
              Server & Infrastructure Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Uptime</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {stats?.system?.uptimeSeconds ? `${Math.floor(stats.system.uptimeSeconds / 60)} min` : 'Active'}
                </p>
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Process Healthy
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Heap Memory Usage</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {stats?.system?.memoryUsageMb ?? 0} MB
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">V8 Engine Allocation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Runtime Environment</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  Node {stats?.system?.nodeVersion ?? 'v20.x'}
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Platform: {stats?.system?.platform ?? 'win32'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Database Engine</span>
                <p className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> MongoDB
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Mongoose Connection Pool</span>
              </div>
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Need to manage registered users?</h4>
                <p className="text-xs text-slate-500 mt-1">Search accounts, activate or deactivate logins, and grant admin roles.</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setActiveTab('users')}>
                View Directory
              </Button>
            </Card>

            <Card className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Audit trail & compliance check</h4>
                <p className="text-xs text-slate-500 mt-1">Inspect all chronological user authentications and mutations.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('logs')}>
                View Audit Trail
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: User Directory */}
      {activeTab === 'users' && (
        <Card className="overflow-hidden">
          {/* Table Filters Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Deactivated Only</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const isSelf = item._id === currentAdmin?._id;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                              {item.name ? item.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                {item.name}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-[11px]">{item.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={item.role === 'Admin' ? 'indigo' : 'default'} size="xs">
                            {item.role === 'Admin' ? (
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Admin
                              </span>
                            ) : (
                              'User'
                            )}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={item.isActive ? 'green' : 'red'} size="xs">
                            {item.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          {item.lastLogin ? format(new Date(item.lastLogin), 'MMM d, HH:mm') : 'Never'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Role Button */}
                            <Button
                              variant="secondary"
                              size="xs"
                              disabled={isSelf}
                              onClick={() => handleToggleRole(item)}
                              title={item.role === 'Admin' ? 'Demote to User' : 'Promote to Admin'}
                              className="text-[11px]"
                            >
                              {item.role === 'Admin' ? 'Demote' : 'Promote'}
                            </Button>

                            {/* Toggle Status Button */}
                            <Button
                              variant={item.isActive ? 'secondary' : 'primary'}
                              size="xs"
                              disabled={isSelf}
                              onClick={() => handleToggleStatus(item)}
                              className={`text-[11px] ${
                                item.isActive ? 'text-rose-600 hover:bg-rose-50 border-rose-200' : ''
                              }`}
                            >
                              {item.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {userPagination.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <span>
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={userPagination.page <= 1}
                  onClick={() => fetchUsers(userPagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={userPagination.page >= userPagination.totalPages}
                  onClick={() => fetchUsers(userPagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: Global Audit Logs */}
      {activeTab === 'logs' && (
        <Card className="overflow-hidden">
          {/* Log Filters Bar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Activity & Audit Stream</h3>
              <p className="text-xs text-slate-500 mt-0.5">Immutable record of logins, role updates, and resource creations</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logEntityFilter}
                onChange={(e) => setLogEntityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Entities</option>
                <option value="USER">User & Auth</option>
                <option value="GOAL">Goal</option>
                <option value="MILESTONE">Milestone</option>
                <option value="TASK">Task</option>
                <option value="SETTINGS">Settings</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>

          {/* Logs List */}
          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No activity logs recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {log.action}
                        </span>
                        <Badge variant="default" size="xs">
                          {log.entityType}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Triggered by <span className="font-semibold text-slate-800">{log.userId?.name || log.userId?.email || 'System'}</span>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <span className="text-slate-500 ml-1">
                            — {JSON.stringify(log.details)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm:ss') : ''}
                    </span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Logs Pagination */}
          {logPagination.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <span>
                Page {logPagination.page} of {logPagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={logPagination.page <= 1}
                  onClick={() => fetchLogs(logPagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={logPagination.page >= logPagination.totalPages}
                  onClick={() => fetchLogs(logPagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Confirmation Dialog for Admin Actions */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, action: null, targetUser: null, nextValue: null, loading: false })}
        onConfirm={handleConfirmAction}
        isLoading={dialogState.loading}
        title={
          dialogState.action === 'status'
            ? `${dialogState.nextValue ? 'Activate' : 'Deactivate'} User Account?`
            : `Change Role to ${dialogState.nextValue}?`
        }
        message={
          dialogState.action === 'status'
            ? `Are you sure you want to ${dialogState.nextValue ? 'activate' : 'deactivate'} account for ${dialogState.targetUser?.name} (${dialogState.targetUser?.email})? ${
                !dialogState.nextValue ? 'They will no longer be able to log in to TaskFlow.' : ''
              }`
            : `Are you sure you want to grant ${dialogState.nextValue} privileges to ${dialogState.targetUser?.name}?`
        }
        confirmText={
          dialogState.action === 'status'
            ? dialogState.nextValue
              ? 'Activate'
              : 'Deactivate'
            : 'Update Role'
        }
        confirmVariant={dialogState.action === 'status' && !dialogState.nextValue ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default AdminPage;
