export default function EmptyState({ message = 'Nothing to show', icon = '🎬' }) {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-center">
      <div className="clay-card p-8 max-w-sm w-full">
        <span className="text-4xl block mb-4">{icon}</span>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
