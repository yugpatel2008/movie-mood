export default function ErrorMessage({ message = 'Something went wrong' }) {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-center">
      <div className="clay-card p-8 max-w-sm w-full">
        <span className="text-4xl block mb-4">⚠️</span>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
