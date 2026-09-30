import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-70px)] text-center p-8">
      <div className="clay-card-elevated p-12 max-w-md w-full">
        <h1 className="text-[6rem] md:text-[8rem] font-black leading-none bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">404</h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="clay-btn clay-btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
