import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/authApi';
import { getMe } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { FiFilm } from 'react-icons/fi';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokenRes = await loginApi({ username, password });
      const token = tokenRes.data.access_token;
      localStorage.setItem('token', token);
      const userRes = await getMe();
      loginUser(token, userRes.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-70px)] p-6">
      <div className="clay-form w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 p-2 rounded-xl text-white flex items-center justify-center" style={{ boxShadow: 'var(--clay-shadow-sm)' }}>
              <FiFilm className="text-lg" />
            </span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">MovieMood</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="clay-input-group">
            <label htmlFor="username">Username</label>
            <input id="username" className="clay-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="clay-input-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="clay-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="clay-alert clay-alert-error mb-4">{error}</div>}
          <button type="submit" className="clay-btn clay-btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-500 text-sm">
          Don't have an account? <Link to="/register" className="text-primary-400 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
