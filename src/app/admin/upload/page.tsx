'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, getOrders, getSarees, resetSareesToDemo, saveSarees } from '@/lib/store';
import { SareeProduct } from '@/lib/types';
import { Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [sarees, setSarees] = useState<SareeProduct[]>([]);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    setSarees(getSarees());
    setOrderCount(getOrders().length);
  }, []);

  const handleEditPrice = (id: string) => {
    const target = sarees.find((s) => s.id === id);
    if (!target) return;
    const rateInput = prompt(`Naya Wholesale Rate (₹/pc) daalein — ${target.name}:`, String(target.wholesale_price));
    if (rateInput === null) return;
    const moqInput = prompt(`Naya MOQ (Pieces per set) daalein — ${target.name}:`, String(target.moq));
    if (moqInput === null) return;

    const updated = sarees.map((s) =>
      s.id === id
        ? {
            ...s,
            wholesale_price: Math.max(100, Number(rateInput) || s.wholesale_price),
            moq: Math.max(1, Number(moqInput) || s.moq),
          }
        : s
    );
    saveSarees(updated);
    setSarees(updated);
  };

  const toggleRunway = (id: string) => {
    const updated = sarees.map((s) =>
      s.id === id ? { ...s, is_runway: !s.is_runway, runway_order: !s.is_runway ? 1 : 99 } : s
    );
    saveSarees(updated);
    setSarees(updated);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Kya aap "${name}" ko catalog se delete karna chahte hain?`)) return;
    const updated = sarees.filter((s) => s.id !== id);
    saveSarees(updated);
    setSarees(updated);
  };

  const handleReset = () => {
    if (!confirm('Kya aap default demo sarees restore karna chahte hain?')) return;
    setSarees(resetSareesToDemo());
  };

  const runwayCount = sarees.filter((s) => s.is_runway).length;

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '72px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '26px',
        }}
      >
        <div>
          <div className="eyebrow">Owner Control Center</div>
          <h1 className="serif-heading" style={{ fontSize: '36px' }}>
            Factory Inventory &amp; Runway
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleReset} className="btn-outline">
            <RotateCcw size={15} /> Reset Demo Data
          </button>
          <Link href="/admin/upload" className="btn-crimson">
            <Plus size={16} /> Upload New Saree
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-soft)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Live Sarees</span>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{sarees.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-soft)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In 3D Runway Showcase</span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-red)' }}>{runwayCount} / 6</div>
        </div>
        <Link
          href="/admin/orders"
          style={{ background: '#231B17', color: '#fff', padding: '18px', borderRadius: '10px', display: 'block' }}
        >
          <span style={{ fontSize: '12px', color: '#C6B9AE' }}>Received B2B Orders</span>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{orderCount} Orders →</div>
        </Link>
      </div>

      {/* Inventory Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sarees.map((s) => (
          <div
            key={s.id}
            style={{
              background: '#fff',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: 1 }}>
              <img
                src={s.model_image}
                alt={s.name}
                style={{ width: '54px', height: '72px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {s.sku} • {s.category}
                </div>
                <strong style={{ fontSize: '16px', fontFamily: 'var(--font-serif)' }}>{s.name}</strong>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                  {formatINR(s.wholesale_price)} / pc &nbsp;•&nbsp; MOQ: {s.moq} pcs
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => toggleRunway(s.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-soft)',
                  background: s.is_runway ? '#231B17' : '#faf5f0',
                  color: s.is_runway ? '#F4D8AE' : '#241c18',
                }}
              >
                <Sparkles size={13} />
                {s.is_runway ? 'On 3D Runway' : 'Add to Runway'}
              </button>

              <button type="button" onClick={() => handleEditPrice(s.id)} className="btn-outline" style={{ padding: '7px 12px', fontSize: '12px' }}>
                Edit Rate / MOQ
              </button>

              <button
                type="button"
                onClick={() => handleDelete(s.id, s.name)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 0,
                  background: '#FCE8E6',
                  color: '#C22B1F',
                  cursor: 'pointer',
                }}
                aria-label="Delete saree"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
