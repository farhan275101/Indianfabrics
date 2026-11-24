'use client';

import { useEffect, useState } from 'react';
import { formatINR, getOrders, updateOrderStatus } from '@/lib/store';
import { OrderStatus, WholesaleOrder } from '@/lib/types';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Packed', 'Dispatched'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);

  useEffect(() => {
    const sync = () => setOrders(getOrders());
    sync();
    window.addEventListener('vv-orders-update', sync);
    return () => window.removeEventListener('vv-orders-update', sync);
  }, []);

  const handleStatusChange = (code: string, status: OrderStatus) => {
    let tracking: string | undefined;
    if (status === 'Dispatched') {
      const input = prompt('Transport / Courier LR Number daalein (Optional):');
      if (input !== null) tracking = input;
    }
    updateOrderStatus(code, status, tracking);
    setOrders(getOrders());
  };

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '72px' }}>
      <div className="eyebrow">Dispatch Desk</div>
      <h1 className="serif-heading" style={{ fontSize: '36px', marginBottom: '24px' }}>
        Wholesale Orders ({orders.length})
      </h1>

      {!orders.length ? (
        <div style={{ background: '#fff', padding: '48px 24px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-soft)' }}>
          <p className="serif-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>
            Abhi koi B2B order nahi aaya hai
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Jab koi buyer Checkout page se bulk order submit karega, to uski poori detail yahan dikhegi.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.order_code}
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-soft)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)' }}>
                    {order.order_code}
                  </span>
                  <h3 className="serif-heading" style={{ fontSize: '24px', fontWeight: 600 }}>
                    {order.business_name}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {order.buyer_name} • 📞 {order.phone} • {order.city_state}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Address: {order.full_address} {order.gst_number ? `• GST: ${order.gst_number}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatINR(order.total_amount)}</div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_code, e.target.value as OrderStatus)}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-soft)',
                      background: '#231B17',
                      color: '#fff',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        Status: {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {order.tracking_info && (
                <div style={{ background: '#f6ece3', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '12px' }}>
                  <strong>LR / Tracking:</strong> {order.tracking_info}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#faf5f0',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <strong>{item.name}</strong> ({item.sku}) — {item.sets * item.moq} Pcs ({item.pack_option})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
