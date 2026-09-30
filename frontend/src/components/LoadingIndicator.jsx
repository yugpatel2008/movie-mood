export default function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-gray-500">
      <div className="clay-spinner mb-4"></div>
      <p>Loading...</p>
    </div>
  );
}
