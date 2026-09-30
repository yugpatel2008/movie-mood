import { Link } from 'react-router-dom';
import { FiCheck, FiFilm } from 'react-icons/fi';

export default function NotificationItem({ notification, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`clay-card cursor-pointer transition-all p-3.5 flex gap-3 items-start border ${
        notification.is_read
          ? 'opacity-70 bg-bg-secondary/40 border-white/4'
          : 'bg-primary-950/30 border-primary-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
      } hover:border-primary-400/50`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div className="shrink-0 w-12 h-16 overflow-hidden rounded-lg bg-bg-secondary flex items-center justify-center">
        {notification.poster_url ? (
          <img src={notification.poster_url} alt={notification.title} className="w-full h-full object-cover" />
        ) : (
          <FiFilm className="text-2xl text-primary-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-primary-400 truncate">🎬 {notification.title}</span>
          {!notification.is_read && (
            <span className="w-2 h-2 rounded-full bg-primary-400 shrink-0 animate-pulse"></span>
          )}
        </div>
        <p className="text-xs text-gray-300 leading-snug mb-1.5 line-clamp-2">{notification.message}</p>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          {notification.matched_genres && (
            <span className="clay-badge py-0.5 px-2 text-[10px]" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--color-primary-300)' }}>
              {notification.matched_genres}
            </span>
          )}
          <span className="ml-auto">{new Date(notification.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
