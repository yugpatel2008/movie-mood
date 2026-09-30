import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import EmptyState from './EmptyState';
import { FiCheckCircle } from 'react-icons/fi';

export default function NotificationDropdown({ notifications, loading, onMarkRead, onMarkAllRead, onClose }) {
  const navigate = useNavigate();

  const handleItemClick = (notif) => {
    if (!notif.is_read) {
      onMarkRead(notif.id);
    }
    onClose();
    navigate(`/movies/${notif.external_movie_id}`);
  };

  return (
    <div
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 clay-card z-50 p-4 max-h-[480px] flex flex-col"
      style={{
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--clay-shadow-elevated)',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(18, 18, 36, 0.96)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8 shrink-0">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <span>🔔 Notifications</span>
          {notifications.some((n) => !n.is_read) && (
            <span className="text-xs font-normal text-primary-400">
              ({notifications.filter((n) => !n.is_read).length} new)
            </span>
          )}
        </h3>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            <FiCheckCircle /> Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 custom-scrollbar">
        {loading ? (
          <div className="text-center py-8 text-xs text-gray-400">Loading recommendations...</div>
        ) : notifications.length === 0 ? (
          <EmptyState
            message="No recommendations yet. Review some titles and MovieMood will learn what you enjoy."
            icon="🎬"
          />
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onClick={() => handleItemClick(notif)}
            />
          ))
        )}
      </div>
    </div>
  );
}
