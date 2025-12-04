// components/AdminLogin.tsx
// Updated to use server-side admin auth at /api/admin-login
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { TranslationStructure } from '../types';

interface AdminLoginProps {
  t: TranslationStructure['admin'];
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ t, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          onLogin();
        } else {
          setError(data.error || 'Invalid credentials');
        }
      } else {
        const text = await res.text();
        setError(text || 'Login failed');
      }
    } catch (err: any) {
      setError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-dark text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif">{t.loginTitle}</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">{t.username}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-brand-gold"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">{t.password}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-brand-gold"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-black transition mt-4"
          >
            {loading ? 'Logging in...' : t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
