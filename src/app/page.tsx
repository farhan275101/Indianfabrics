'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import RunwaySection from '@/components/RunwaySection';
import CategoryGrid from '@/components/CategoryGrid';
import SareeCard from '@/components/SareeCard';
import { getSarees } from '@/lib/store';
import { SareeProduct } from '@/lib/types';

const CATEGORIES = [
  'All',
  'Banarasi Silk',
  'Cotton & Linen',
  'Bridal & Festive',
  'Organza & Tissue',
];

export default function HomePage() {
  const [sarees, setSarees] = useState<SareeProduct[]>([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'low' | 'high'>('featured');

  useEffect(() => {
    const sync = () => setSarees(getSarees());
    const onCatEvent = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail) setCategory(ce.detail);
    };
    sync();
    window.addEventListener('vv-store-update', sync);
    window.addEventListener('vv-filter-category', onCatEvent);
    return () => {
      window.removeEventListener('vv-store-update', sync);
      window.removeEventListener('vv-filter-category', onCatEvent);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...sarees];
    if (category !== 'All') {
      list = list.filter((s) => s.category === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.sku.toLowerCase().includes(q) ||
          s.fabric.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'low') list.sort((a, b) => a.wholesale_price - b.wholesale_price);
    if (sortBy === 'high') list.sort((a, b) => b.wholesale_price - a.wholesale_price);
    return list;
  }, [sarees, category, query, sortBy]);

  return (
    <>
      <RunwaySection />

      {/* Trust Strip */}
      <section style={{ background: '#231B17', color: '#F6ECE3', padding: '24px' }}>
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '22px',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', color: '#B68D52' }}>✦</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#fff' }}>Direct Factory Pricing</strong>
              <span style={{ fontSize: '12.5px', color: '#C6B9AE' }}>
                Zero middlemen. Pure loom-to-showroom margins for boutiques.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', color: '#B68D52' }}>📦</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#fff' }}>Insured Transport Dispatch</strong>
              <span style={{ fontSize: '12.5px', color: '#C6B9AE' }}>
                48-hour parcel dispatch across all Indian states &amp; worldwide export.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', color: '#B68D52' }}>🏭</span>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#fff' }}>Custom Bulk Weaving</strong>
              <span style={{ fontSize: '12.5px', color: '#C6B9AE' }}>
                Custom dye shades &amp; showroom branding available on bulk lots.
              </span>
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid />

      {/* Filterable Wholesale Catalog */}
      <section
        id="catalog"
        style={{
          background: 'var(--bg-blush)',
          borderTop: '1px solid var(--border-soft)',
          borderBottom: '1px solid var(--border-soft)',
          padding: '68px 0',
        }}
      >
        <div className="container">
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
              <div className="eyebrow">Direct Manufacturer Catalog</div>
              <h2 className="serif-heading" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
                {category === 'All' ? 'All Wholesale Designs' : category}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search SKU (VV-101), silk, fabric..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-soft)',
                  background: '#fff',
                  fontSize: '13px',
                  minWidth: '230px',
                }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'low' | 'high')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-soft)',
                  background: '#fff',
                  fontSize: '13px',
                }}
              >
                <option value="featured">Sort: Featured Looms</option>
                <option value="low">Rate: Low to High</option>
                <option value="high">Rate: High to Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: active ? '#231B17' : 'var(--border-soft)',
                    background: active ? '#231B17' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--text-main)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {filtered.map((saree) => (
              <SareeCard key={saree.id} saree={saree} />
            ))}
          </div>

          {!filtered.length && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <p className="serif-heading" style={{ fontSize: '24px', marginBottom: '12px' }}>
                No wholesale designs match your search.
              </p>
              <button
                type="button"
                className="btn-crimson"
                onClick={() => {
                  setCategory('All');
                  setQuery('');
                }}
              >
                Show All Designs
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Factory Story Section */}
      <section className="container" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow">Our Weaving Legacy</div>
            <h2 className="serif-heading" style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '16px' }}>
              For moments that become showroom bestsellers.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
              Operating 120+ looms across Varanasi and Surat, VastraVani delivers consistent wholesale quality, genuine zari work, and fast 48-hour transport dispatch for boutique owners and saree showrooms.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/checkout" className="btn-crimson">
                Bulk Order Desk →
              </Link>
              <Link href="/admin/upload" className="btn-outline">
                Owner: Upload Saree Photo
              </Link>
            </div>
          </div>

          <div style={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '4/3', background: '#eadfd5' }}>
            <img
              src="https://images.unsplash.com/photo-1728544845420-6d5a610fc890?auto=format&fit=crop&w=1200&q=85"
              alt="VastraVani Loom Craft"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
