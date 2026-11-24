'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAdminLoggedIn, setAdminSession } from '@/lib/store';
import { Lock, LogOut, Package, PlusCircle, LayoutGrid } from 'lucide-react';

const DEMO_OWNER_PIN = '1234';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    setChecked(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === DEMO_OWNER_PIN) {
      setAdminSession(true);
      setAuthed(true);
      setError('');
    } else {
      setError('Galat PIN! Demo PIN 1234 daalein.');
    }
  };

  const handleLogout = () => {
    setAdminSession(false);
    setAuthed(false);
    setPin('');
  };

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="container" style={{ maxWidth: '420px', padding: '80px 24px' }}>
        <form
          onSubmit={handleLogin}
          style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '14px',
            border: '1px solid var(--border-soft)',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(35,27,23,0.06)',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#f6ece3',
              color: '#231B17',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Lock size={22} />
          </div>
          <div className="eyebrow">Manufacturer Portal</div>
          <h1 className="serif-heading" style={{ fontSize: '30px', marginBottom: '8px' }}>
            Owner Admin Login
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Demo testing ke liye Owner PIN <strong>1234</strong> enter karein.
          </p>

          <input
            type="password"
            placeholder="Enter Owner PIN (1234)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              fontSize: '15px',
              textAlign: 'center',
              letterSpacing: '0.2em',
              marginBottom: '12px',
            }}
          />

          {error && (
            <p style={{ color: 'var(--accent-red)', fontSize: '12.5px', fontWeight: 600, marginBottom: '12px' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-crimson" style={{ width: '100%' }}>
            Unlock Admin Dashboard →
          </button>
        </form>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Inventory', icon: LayoutGrid },
    { href: '/admin/upload', label: '+ Upload Saree', icon: PlusCircle },
    { href: '/admin/orders', label: 'B2B Orders', icon: Package },
  ];

  return (
    <div>
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--border-soft)',
          padding: '12px 24px',
        }}
      >
        <div
          className="container"
          style={{
            padding: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: active ? '#231B17' : '#faf5f0',
                    color: active ? '#fff' : '#241c18',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid var(--border-soft)',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <LogOut size={14} /> Lock Admin
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
