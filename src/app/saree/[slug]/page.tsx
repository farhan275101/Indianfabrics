'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { addToBag, formatINR, getSarees } from '@/lib/store';
import { SareeProduct } from '@/lib/types';
import { buildWholesaleWhatsAppUrl } from '@/lib/whatsapp';
import { ArrowLeft, Check, MessageCircle, ShoppingBag } from 'lucide-react';

export default function SareeDetailPage() {
  const params = useParams<{ slug: string }>();
  const [saree, setSaree] = useState<SareeProduct | null>(null);
  const [activeImg, setActiveImg] = useState('');
  const [packOption, setPackOption] = useState('');
  const [sets, setSets] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const all = getSarees();
    const found = all.find((s) => s.slug === params?.slug) || all[0] || null;
    if (found) {
      setSaree(found);
      setActiveImg(found.model_image);
      setPackOption(found.pack_options[0] || `${found.moq}-Pc Set`);
    }
  }, [params?.slug]);

  if (!saree) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Loading saree design...</p>
      </div>
    );
  }

  const allPhotos = Array.from(new Set([saree.model_image, ...(saree.gallery_images || [])])).filter(Boolean);
  const totalPcs = sets * saree.moq;
  const totalCost = totalPcs * saree.wholesale_price;

  const handleAdd = () => {
    addToBag(saree, packOption, sets);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event('vv-open-bag'));
  };

  const whatsappLink = buildWholesaleWhatsAppUrl([
    {
      id: saree.id,
      sku: saree.sku,
      name: saree.name,
      model_image: saree.model_image,
      wholesale_price: saree.wholesale_price,
      moq: saree.moq,
      sets,
      pack_option: packOption,
    },
  ]);

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '72px' }}>
      <Link
        href="/#catalog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} /> Back to Factory Catalog
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* Multi-Photo Gallery */}
        <div>
          <div
            style={{
              aspectRatio: '3/4',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#f2e8df',
              marginBottom: '12px',
            }}
          >
            <img
              src={activeImg || saree.model_image}
              alt={saree.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {allPhotos.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(img)}
                style={{
                  width: '74px',
                  height: '92px',
                  padding: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImg === img ? '2px solid var(--accent-red)' : '1px solid var(--border-soft)',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Wholesale Details */}
        <div>
          <div className="eyebrow">
            {saree.sku} • {saree.category}
          </div>
          <h1 className="serif-heading" style={{ fontSize: 'clamp(32px, 4vw, 44px)', marginBottom: '12px' }}>
            {saree.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <strong style={{ fontSize: '26px', color: '#231B17' }}>
              {formatINR(saree.wholesale_price)} / pc
            </strong>
            <span
              style={{
                background: '#f6ece3',
                color: '#7c5221',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              MOQ: {saree.moq} Pieces (1 Set)
            </span>
          </div>

          <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {saree.description}
          </p>

          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border-soft)',
              borderRadius: '10px',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '22px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Fabric</span>
              <strong>{saree.fabric}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Set Packing</span>
              <strong>{saree.set_description}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Length</span>
              <strong>5.5m Saree + 0.8m Blouse</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Dispatch</span>
              <strong>24–48 Hours Ex-Factory</strong>
            </div>
          </div>

          {/* Pack Selector */}
          <div style={{ marginBottom: '18px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              Choose Pack Option:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {saree.pack_options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPackOption(opt)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: packOption === opt ? '#231B17' : 'var(--border-soft)',
                    background: packOption === opt ? '#231B17' : '#fff',
                    color: packOption === opt ? '#fff' : 'var(--text-main)',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Sets Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>Number of Sets:</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-soft)', borderRadius: '8px', background: '#fff' }}>
              <button
                type="button"
                onClick={() => setSets((s) => Math.max(1, s - 1))}
                style={{ padding: '8px 14px', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}
              >
                −
              </button>
              <span style={{ padding: '0 12px', fontWeight: 700, fontSize: '14px' }}>
                {sets} ({totalPcs} Pcs)
              </span>
              <button
                type="button"
                onClick={() => setSets((s) => s + 1)}
                style={{ padding: '8px 14px', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleAdd} className="btn-crimson" style={{ flex: 1, minWidth: '210px' }}>
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? 'Added to Wholesale Bag' : `Add ${totalPcs} Pcs (${formatINR(totalCost)})`}
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                minWidth: '200px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#177844',
                color: '#fff',
                borderRadius: '6px',
                padding: '13px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
              }}
            >
              <MessageCircle size={17} />
              Inquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
