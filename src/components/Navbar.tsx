'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBag } from '@/lib/store';
import { Menu, ShoppingBag, X } from 'lucide-react';

export default function Navbar() {
  const [totalPcs, setTotalPcs] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const bag = getBag();
      setTotalPcs(bag.reduce((sum, item) => sum + item.sets * item.moq, 0));
    };
    sync();
    window.addEventListener('vv-bag-update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('vv-bag-update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const openBag = () => {
    window.dispatchEvent(new Event('vv-open-bag'));
  };

  return (
    <>
      <div
        style={{
          background: '#231B17',
          color: '#F4EAE1',
          fontSize: '11.5px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '8px 16px',
          textAlign: 'center',
        }}
      >
        Direct From Varanasi &amp; Surat Looms &nbsp;✦&nbsp; 100% B2B Wholesale Factory Rates &nbsp;✦&nbsp; Pan-India &amp; Global Dispatch
      </div>

      <header
        className="shopify-section-group-header-group"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e4ddd5',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            height: '76px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="nav-mobile-btn"
              style={{
                background: 'none',
                border: 0,
                padding: '6px',
                cursor: 'pointer',
                display: 'none',
              }}
            >
              <Menu size={22} />
            </button>

            <Link href="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: '#231B17',
                }}
              >
                VastraVani
              </span>
              <span
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#B68D52',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                Wholesale Looms
              </span>
            </Link>
          </div>

          <nav
            className="nav-desktop-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '26px',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
            <Link href="/#runway">3D Runway</Link>
            <Link href="/#catalog">Factory Catalog</Link>
            <Link href="/track-order">Track Order</Link>
            <Link href="/checkout">Bulk Checkout</Link>
            <Link
              href="/admin"
              style={{
                background: '#f6ece3',
                color: '#7c5221',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '12px',
              }}
            >
              Owner Admin
            </Link>
          </nav>

          <button
            type="button"
            onClick={openBag}
            aria-label="Open wholesale bag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#231B17',
              color: '#fff',
              border: 0,
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={16} />
            <span>Bag ({totalPcs} Pcs)</span>
          </button>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .nav-desktop-links { display: none !important; }
            .nav-mobile-btn { display: inline-flex !important; }
          }
        `}</style>
      </header>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              background: '#faf5f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontStyle: 'italic' }}>
                VastraVani
              </strong>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <Link href="/#runway" onClick={() => setMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid #e6dcd3' }}>
              3D Runway
            </Link>
            <Link href="/#catalog" onClick={() => setMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid #e6dcd3' }}>
              Factory Catalog
            </Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid #e6dcd3' }}>
              Track Order
            </Link>
            <Link href="/checkout" onClick={() => setMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid #e6dcd3' }}>
              Bulk Checkout
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              style={{ padding: '10px 14px', background: '#231B17', color: '#fff', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}
            >
              Owner Admin Panel
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
