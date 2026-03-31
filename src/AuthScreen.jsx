import { useState } from 'react';
import { supabase } from './supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    setError('');
    setSuccess('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess('Account created! Check your email to confirm, then log in.');
    }
    setLoading(false);
  }

  async function handleReset() {
    if (!email) { setError('Enter your email address first.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSuccess('Password reset email sent — check your inbox.');
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', minHeight: '100dvh',
      background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>⚡</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            Chip Away
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
            Consistency over intensity
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#1e293b',
          borderRadius: 20,
          padding: '28px 24px',
          border: '0.5px solid #334155',
        }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#f1f5f9', marginBottom: 20 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </div>

          {error && (
            <div style={{
              background: '#450a0a', color: '#fca5a5',
              padding: '10px 14px', borderRadius: 10,
              fontSize: 13, marginBottom: 14,
              border: '0.5px solid #7f1d1d',
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              background: '#052e16', color: '#86efac',
              padding: '10px 14px', borderRadius: 10,
              fontSize: 13, marginBottom: 14,
              border: '0.5px solid #14532d',
            }}>{success}</div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#0f172a', border: '0.5px solid #334155',
                borderRadius: 10, fontSize: 14, color: '#f1f5f9',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#0f172a', border: '0.5px solid #334155',
                borderRadius: 10, fontSize: 14, color: '#f1f5f9',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#334155' : '#f8fafc',
              color: '#0f172a', borderRadius: 12,
              border: 'none', fontSize: 15, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '10px',
                background: 'none', border: 'none',
                color: '#475569', fontSize: 13,
                cursor: 'pointer', marginTop: 8,
                fontFamily: 'inherit',
              }}
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>

      </div>
    </div>
  );
}
