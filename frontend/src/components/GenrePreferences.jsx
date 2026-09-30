import { useState, useEffect } from 'react';
import { getMyPreferences, updateUserSettings } from '../services/preferenceApi';
import LoadingIndicator from './LoadingIndicator';
import EmptyState from './EmptyState';
import { FiSliders, FiCheckCircle } from 'react-icons/fi';

export default function GenrePreferences() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchPrefs = async () => {
    setLoading(true);
    try {
      const res = await getMyPreferences();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleToggleSettings = async () => {
    if (!data) return;
    setUpdating(true);
    try {
      const nextState = !data.notifications_enabled;
      await updateUserSettings({ notifications_enabled: nextState });
      setData((prev) => ({ ...prev, notifications_enabled: nextState }));
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingIndicator />;
  if (!data) return null;

  const { preferences, interested_genres, notifications_enabled } = data;
  const maxScore = preferences.length > 0 ? Math.max(...preferences.map((p) => p.score), 1) : 1;

  return (
    <div className="clay-card-elevated p-6 md:p-8 mb-10" style={{ borderRadius: 'var(--radius-xl)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiSliders className="text-primary-400" /> Your Movie Moods & Genre Interests
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            MovieMood uses the genres of titles you rate positively to recommend new content.
          </p>
        </div>

        {/* Privacy / Recommendation Toggle */}
        <button
          onClick={handleToggleSettings}
          disabled={updating}
          className={`clay-btn text-xs px-4 py-2 self-start sm:self-auto transition-all ${
            notifications_enabled ? 'clay-btn-primary' : 'clay-btn-secondary opacity-70'
          }`}
        >
          <FiCheckCircle />
          Personalized Recommendations: <strong className="ml-1">{notifications_enabled ? 'ON' : 'OFF'}</strong>
        </button>
      </div>

      {preferences.length === 0 ? (
        <EmptyState message="Review movies and shows to build your MovieMood." icon="📊" />
      ) : (
        <div className="space-y-4">
          {preferences.map((item) => {
            const isInterested = interested_genres.includes(item.genre);
            const percentage = Math.max(10, Math.min(100, (item.score / maxScore) * 100));

            return (
              <div key={item.genre} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200">{item.genre}</span>
                    {isInterested && (
                      <span className="clay-badge py-0 px-2 text-[10px]" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                        Top Interest
                      </span>
                    )}
                  </div>
                  <span className={item.score > 0 ? 'text-primary-400 font-mono' : 'text-gray-500 font-mono'}>
                    Score: {item.score > 0 ? `+${item.score}` : item.score}
                  </span>
                </div>

                <div className="clay-sentiment-bar h-2.5 bg-bg-secondary overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: isInterested
                        ? 'linear-gradient(90deg, var(--color-primary-500), #34d399)'
                        : 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.25))',
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
