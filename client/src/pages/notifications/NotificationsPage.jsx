import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Sparkles,
  Calendar,
  AlertTriangle,
  Repeat,
  Check,
} from 'lucide-react';
import Button from '../../components/common/Button';
import notificationService from '../../services/notification.service';
import toast from 'react-hot-toast';

const sampleInAppNotifs = [
  {
    _id: 'notif_1',
    title: 'Milestone Completed!',
    message: 'You completed "SQL Fundamentals". Claim your reward: Watch a movie!',
    type: 'milestone',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    _id: 'notif_2',
    title: 'Task Due Today',
    message: 'Practice INNER and LEFT JOINs is scheduled for today.',
    type: 'deadline',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: 'notif_3',
    title: 'Daily Recurrence Generated',
    message: 'Fresh occurrence for "Daily Revision" was added to My Day.',
    type: 'recurrence',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    _id: 'notif_4',
    title: 'Goal Milestone Achieved',
    message: 'Great momentum! 50% of milestones in Learn MySQL are finished.',
    type: 'goal',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'deadline', 'milestone'
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.data?.notifications && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(sampleInAppNotifs);
      }
    } catch {
      setNotifications(sampleInAppNotifs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
    } catch {}
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'deadline') return n.type === 'deadline' || n.type === 'overdue';
    if (activeTab === 'milestone') return n.type === 'milestone' || n.type === 'goal';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notification Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Stay alerted on deadlines, milestone accomplishments, and schedule occurrences
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
        {['all', 'unread', 'deadline', 'milestone'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'all'
              ? 'All Alerts'
              : tab === 'unread'
              ? `Unread (${unreadCount})`
              : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No notifications in this view</h4>
          <p className="text-xs text-slate-500 mt-1">
            You're all caught up with your upcoming goals and task schedules.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredNotifs.map((n) => {
            const isRead = n.isRead;
            return (
              <div
                key={n._id}
                className={`p-4 flex items-start justify-between gap-3 transition ${
                  !isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'milestone' || n.type === 'goal'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'overdue'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {n.type === 'milestone' || n.type === 'goal' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : n.type === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4
                      className={`text-sm ${
                        !isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50 transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
