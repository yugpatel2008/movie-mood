import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi, getMe } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { FiFilm } from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerApi(form);
      const { login: loginFn } = await import('../services/authApi');
      const tokenRes = await loginFn({ username: form.username, password: form.password });
      const token = tokenRes.data.access_token;
      localStorage.setItem('token', token);
      const userRes = await getMe();
      loginUser(token, userRes.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
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
          <h1 className="text-2xl font-extrabold mb-1">Create Your Account</h1>
          <p className="text-gray-500 text-sm">Join MovieMood today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="clay-input-group">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" className="clay-input" type="text" value={form.username} onChange={handleChange} required minLength={3} />
          </div>
          <div className="clay-input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" className="clay-input" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="clay-input-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" className="clay-input" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="clay-input-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input id="confirm_password" name="confirm_password" className="clay-input" type="password" value={form.confirm_password} onChange={handleChange} required />
          </div>
          {error && <div className="clay-alert clay-alert-error mb-4">{error}</div>}
          <button type="submit" className="clay-btn clay-btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-primary-400 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
