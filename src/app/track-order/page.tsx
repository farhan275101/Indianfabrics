'use client';

import { useState } from 'react';
import { formatINR, getOrders } from '@/lib/store';
import { WholesaleOrder } from '@/lib/types';

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<WholesaleOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getOrders();
    const match = all.find(
      (o) =>
        o.order_code.toLowerCase() === orderCode.trim().toLowerCase() &&
        o.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-4))
    );
    setResult(match || null);
    setSearched(true);
  };

  return (
    <div className="container" style={{ maxWidth: '640px', paddingTop: '56px', paddingBottom: '80px' }}>
      <div className="eyebrow">Dispatch Tracker</div>
      <h1 className="serif-heading" style={{ fontSize: '38px', marginBottom: '10px' }}>
        Track Your Wholesale Parcel
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Enter your Order Code (e.g. VV-B2B-1234) and registered phone number to check live factory status.
      </p>

      <form
        onSubmit={handleTrack}
        style={{
          background: '#fff',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid var(--border-soft)',
          display: 'grid',
          gap: '14px',
          marginBottom: '26px',
        }}
      >
        <input
          required
          placeholder="Order ID (e.g. VV-B2B-4821)"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          style={{ padding: '11px 14px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
        />
        <input
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '11px 14px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
        />
        <button type="submit" className="btn-crimson">
          Check Dispatch Status
        </button>
      </form>

      {searched && !result && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--accent-red)', fontWeight: 600 }}>
            No order found with that Order ID &amp; Phone combination.
          </p>
        </div>
      )}

      {result && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ fontSize: '18px' }}>{result.order_code}</strong>
            <span
              style={{
                background: '#231B17',
                color: '#F4D8AE',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Status: {result.status}
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
            Buyer: <strong>{result.business_name}</strong> ({result.city_state})
          </p>
          {result.tracking_info && (
            <div style={{ background: '#f6ece3', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              <strong>Transport / Tracking LR:</strong> {result.tracking_info}
            </div>
          )}
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            Order Total: {formatINR(result.total_amount)}
          </div>
        </div>
      )}
    </div>
  );
}
