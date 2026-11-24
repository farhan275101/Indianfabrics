'use client';

import Link from 'next/link';
import { addToBag, formatINR } from '@/lib/store';
import { SareeProduct } from '@/lib/types';

function showToast(msg: string) {
  let toast = document.getElementById('vv-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vv-global-toast';
    toast.className = 'vv-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 2500);
}

export default function SareeCard({ saree }: { saree: SareeProduct }) {
  const handleAdd = () => {
    addToBag(saree, saree.pack_options[0] || `${saree.moq}-Pc Set`, 1);
    showToast(`${saree.name} (${saree.moq} Pcs Set) added to bag`);
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(230,220,211,0.8)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(35,27,23,0.04)',
      }}
    >
      <Link
        href={`/saree/${saree.slug}`}
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          background: '#f2e8df',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <img
          src={saree.model_image}
          alt={saree.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {saree.badge && (
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: saree.badge === 'New Arrival' ? 'var(--accent-red)' : '#231B17',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 9px',
              borderRadius: '4px',
            }}
          >
            {saree.badge}
          </span>
        )}
      </Link>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px',
          }}
        >
          <span>{saree.sku}</span>
          <span>{saree.category}</span>
        </div>

        <Link href={`/saree/${saree.slug}`}>
          <h3 className="serif-heading" style={{ fontSize: '21px', fontWeight: 600, marginBottom: '6px' }}>
            {saree.name}
          </h3>
        </Link>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
          {saree.fabric}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <strong style={{ fontSize: '16px', color: '#231B17' }}>
            {formatINR(saree.wholesale_price)} / pc
          </strong>
          <span
            style={{
              fontSize: '11px',
              background: '#f6ece3',
              color: '#7c5221',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            MOQ: {saree.moq} pcs
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="btn-crimson"
          style={{ marginTop: 'auto', width: '100%', padding: '11px' }}
        >
          Add {saree.moq}-Pc Set ({formatINR(saree.wholesale_price * saree.moq)})
        </button>
      </div>
    </div>
  );
}
