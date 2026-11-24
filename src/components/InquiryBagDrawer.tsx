'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, getBag, saveBag } from '@/lib/store';
import { BagItem } from '@/lib/types';
import { buildWholesaleWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle, Trash2, X } from 'lucide-react';

export default function InquiryBagDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BagItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getBag());
    const handleOpen = () => {
      sync();
      setOpen(true);
    };
    sync();
    window.addEventListener('vv-bag-update', sync);
    window.addEventListener('vv-open-bag', handleOpen);
    return () => {
      window.removeEventListener('vv-bag-update', sync);
      window.removeEventListener('vv-open-bag', handleOpen);
    };
  }, []);

  if (!open) return null;

  const updateSets = (idx: number, delta: number) => {
    const updated = [...items];
    updated[idx].sets += delta;
    if (updated[idx].sets <= 0) updated.splice(idx, 1);
    saveBag(updated);
    setItems(updated);
  };

  const removeItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    saveBag(updated);
    setItems(updated);
  };

  const totalPcs = items.reduce((sum, i) => sum + i.sets * i.moq, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.sets * i.moq * i.wholesale_price, 0);

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 15, 12, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 4000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '430px',
          maxWidth: '100%',
          height: '100%',
          background: '#faf5f0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            background: '#ffffff',
            borderBottom: '1px solid #e6dcd3',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 className="serif-heading" style={{ fontSize: '26px', fontWeight: 600 }}>
              Wholesale Bag
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {totalPcs} Total Pieces Selected
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 0, cursor: 'pointer', padding: '6px' }}
            aria-label="Close bag"
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!items.length ? (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-muted)' }}>
              <p className="serif-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>
                Your wholesale bag is empty
              </p>
              <p style={{ fontSize: '13px' }}>
                Select any saree set from the 3D Runway or Factory Catalog to request a bulk order.
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const pcs = item.sets * item.moq;
              const lineTotal = pcs * item.wholesale_price;
              return (
                <div
                  key={`${item.id}-${item.pack_option}`}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e6dcd3',
                  }}
                >
                  <img
                    src={item.model_image}
                    alt={item.name}
                    style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.sku} • {item.pack_option}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{ background: 'none', border: 0, cursor: 'pointer', color: '#999' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h4 className="serif-heading" style={{ fontSize: '18px', fontWeight: 600, margin: '2px 0 4px' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {formatINR(item.wholesale_price)}/pc × {pcs} pcs ({item.sets} {item.sets === 1 ? 'set' : 'sets'})
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e6dcd3', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateSets(idx, -1)}
                          style={{ background: 'none', border: 0, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 8px' }}>
                          {item.sets} Set
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSets(idx, 1)}
                          style={{ background: 'none', border: 0, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          +
                        </button>
                      </div>
                      <strong style={{ fontSize: '14px' }}>{formatINR(lineTotal)}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '20px 24px', background: '#ffffff', borderTop: '1px solid #e6dcd3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
              <span>Estimated Ex-Factory Total</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Total Quantity: {totalPcs} Sarees (GST &amp; Transport calculated on invoice)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="btn-crimson"
                style={{ width: '100%' }}
              >
                Submit Bulk Order Form →
              </Link>
              <a
                href={buildWholesaleWhatsAppUrl(items)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#177844',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                }}
              >
                <MessageCircle size={17} />
                Send Order on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
