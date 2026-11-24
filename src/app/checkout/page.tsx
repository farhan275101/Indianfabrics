'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, getBag, saveBag, saveOrder } from '@/lib/store';
import { BagItem, WholesaleOrder } from '@/lib/types';
import { buildWholesaleWhatsAppUrl } from '@/lib/whatsapp';
import { CheckCircle2, MessageCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [items, setItems] = useState<BagItem[]>([]);
  const [submittedOrder, setSubmittedOrder] = useState<WholesaleOrder | null>(null);

  const [form, setForm] = useState({
    buyer_name: '',
    business_name: '',
    phone: '',
    city_state: '',
    full_address: '',
    gst_number: '',
    notes: '',
  });

  useEffect(() => {
    setItems(getBag());
  }, []);

  const totalPcs = items.reduce((sum, i) => sum + i.sets * i.moq, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.sets * i.moq * i.wholesale_price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    const orderCode = 'VV-B2B-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: WholesaleOrder = {
      order_code: orderCode,
      buyer_name: form.buyer_name.trim(),
      business_name: form.business_name.trim(),
      phone: form.phone.trim(),
      city_state: form.city_state.trim(),
      full_address: form.full_address.trim(),
      gst_number: form.gst_number.trim(),
      items,
      total_amount: totalAmount,
      notes: form.notes.trim(),
      status: 'Pending',
      tracking_info: '',
      created_at: new Date().toISOString(),
    };

    saveOrder(newOrder);
    saveBag([]);
    setSubmittedOrder(newOrder);
  };

  if (submittedOrder) {
    const waUrl = buildWholesaleWhatsAppUrl(submittedOrder.items, {
      order_code: submittedOrder.order_code,
      business_name: submittedOrder.business_name,
      buyer_name: submittedOrder.buyer_name,
      city_state: submittedOrder.city_state,
    });

    return (
      <div className="container" style={{ maxWidth: '680px', padding: '72px 24px', textAlign: 'center' }}>
        <CheckCircle2 size={56} color="#177844" style={{ margin: '0 auto 16px' }} />
        <div className="eyebrow">Wholesale Order Received</div>
        <h1 className="serif-heading" style={{ fontSize: '38px', marginBottom: '12px' }}>
          Thank you, {submittedOrder.business_name}!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '22px' }}>
          Your bulk order request has been recorded. Save your Order ID to track factory dispatch status:
        </p>

        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border-soft)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
            Order Reference Code
          </span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#231B17', margin: '4px 0 8px' }}>
            {submittedOrder.order_code}
          </div>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Estimated Factory Bill: <strong>{formatINR(submittedOrder.total_amount)}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#177844',
              color: '#fff',
              padding: '13px 24px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <MessageCircle size={17} />
            Confirm on WhatsApp Now
          </a>
          <Link href="/track-order" className="btn-outline">
            Track Order Status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '44px', paddingBottom: '72px' }}>
      <div className="eyebrow">B2B Dispatch Desk</div>
      <h1 className="serif-heading" style={{ fontSize: 'clamp(32px, 4vw, 44px)', marginBottom: '28px' }}>
        Submit Wholesale Bulk Order
      </h1>

      {!items.length ? (
        <div style={{ background: '#fff', padding: '48px 24px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-soft)' }}>
          <p className="serif-heading" style={{ fontSize: '24px', marginBottom: '12px' }}>
            Your wholesale bag is empty
          </p>
          <Link href="/#catalog" className="btn-crimson">
            Browse Factory Designs →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '32px', alignItems: 'start' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff',
              padding: '26px',
              borderRadius: '12px',
              border: '1px solid var(--border-soft)',
              display: 'grid',
              gap: '16px',
            }}
          >
            <h2 className="serif-heading" style={{ fontSize: '24px' }}>Buyer &amp; Transport Details</h2>

            <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
              Shop / Boutique Name *
              <input
                required
                placeholder="e.g. Mahalaxmi Silk Emporium"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
                Buyer Full Name *
                <input
                  required
                  placeholder="Rajesh Agarwal"
                  value={form.buyer_name}
                  onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                  style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
                WhatsApp / Mobile *
                <input
                  required
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
                City &amp; State *
                <input
                  required
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={form.city_state}
                  onChange={(e) => setForm({ ...form, city_state: e.target.value })}
                  style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
                GST Number (Optional)
                <input
                  placeholder="08ABCDE1234F1Z5"
                  value={form.gst_number}
                  onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                  style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
              Full Delivery / Transport Address *
              <textarea
                required
                rows={3}
                placeholder="Shop no, Market name, Pincode, Preferred Transport..."
                value={form.full_address}
                onChange={(e) => setForm({ ...form, full_address: e.target.value })}
                style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600 }}>
              Notes / Color Preference (Optional)
              <input
                placeholder="e.g. Extra red/maroon shades needed"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ padding: '11px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px' }}
              />
            </label>

            <button type="submit" className="btn-crimson" style={{ width: '100%', padding: '14px' }}>
              Place Wholesale Order ({formatINR(totalAmount)}) →
            </button>
          </form>

          {/* Summary Box */}
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-soft)',
            }}
          >
            <h2 className="serif-heading" style={{ fontSize: '24px', marginBottom: '16px' }}>
              Order Summary ({totalPcs} Pcs)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {items.map((item) => {
                const pcs = item.sets * item.moq;
                return (
                  <div
                    key={`${item.id}-${item.pack_option}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid var(--border-soft)',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong> ({item.sku})
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {item.pack_option} • {pcs} Pcs × {formatINR(item.wholesale_price)}
                      </div>
                    </div>
                    <strong>{formatINR(pcs * item.wholesale_price)}</strong>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
              <span>Ex-Factory Total</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Our dispatch desk will share the final GST proforma invoice &amp; transport LR details on your WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
