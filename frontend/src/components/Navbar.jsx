import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FiFilm, FiMenu, FiX, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="clay-nav">
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-2xl font-extrabold" onClick={() => setMenuOpen(false)}>
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 p-1.5 rounded-xl text-white flex items-center justify-center" style={{ boxShadow: 'var(--clay-shadow-sm)' }}>
            <FiFilm className="text-lg" />
          </span>
          <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">MovieMood</span>
        </Link>

        <button className="md:hidden text-2xl text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`md:flex items-center gap-1 ${menuOpen ? 'flex flex-col absolute top-[70px] left-0 right-0 bg-bg-primary/95 backdrop-blur-xl p-4 border-b border-white/6' : 'hidden'}`} style={menuOpen ? { boxShadow: '0 10px 30px rgba(0,0,0,0.4)' } : undefined}>
          <Link to="/" className="clay-nav-link w-full md:w-auto text-center" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/movies" className="clay-nav-link w-full md:w-auto text-center" onClick={() => setMenuOpen(false)}>Movies</Link>

          {user ? (
            <div className="flex flex-col md:flex-row items-center gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/6 w-full md:w-auto ml-0 md:ml-3">
              <NotificationBell />
              <Link to="/profile" className="clay-nav-link text-primary-400 w-full md:w-auto justify-center" onClick={() => setMenuOpen(false)}>
                <FiUser /> {user.username}
              </Link>
              <button onClick={handleLogout} className="clay-nav-link w-full md:w-auto justify-center hover:!text-red-400 hover:!bg-red-500/10">
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-1 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/6 w-full md:w-auto ml-0 md:ml-3">
              <Link to="/login" className="clay-nav-link w-full md:w-auto justify-center" onClick={() => setMenuOpen(false)}>
                <FiLogIn /> Login
              </Link>
              <Link to="/register" className="clay-btn clay-btn-primary text-sm w-full md:w-auto justify-center" onClick={() => setMenuOpen(false)}>
                <FiUserPlus /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
