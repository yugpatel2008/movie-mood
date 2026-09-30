import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationApi';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!open) {
      fetchList();
    }
    setOpen(!open);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleToggle}
        className="clay-nav-link relative flex items-center justify-center gap-1.5 py-2 px-3"
        aria-label="Notifications"
        title="Personalized Notifications"
      >
        <FiBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(239,68,68,0.5)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
