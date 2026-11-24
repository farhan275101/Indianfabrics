import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#231B17',
        color: '#E8DDD3',
        padding: '60px 24px 28px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', fontStyle: 'italic', color: '#fff' }}>
            VastraVani
          </div>
          <p style={{ fontSize: '13.5px', color: '#B9ABA0', marginTop: '10px', maxWidth: '300px' }}>
            Direct manufacturer of pure Banarasi, Bridal Zari, Organza &amp; Handloom Cotton sarees. Supplying 450+ showrooms &amp; boutiques across India.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B68D52', marginBottom: '14px' }}>
            Wholesale Buyer Desk
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13.5px' }}>
            <li><Link href="/#runway">3D Runway Showcase</Link></li>
            <li><Link href="/#catalog">All Factory Designs</Link></li>
            <li><Link href="/checkout">Submit Bulk Order</Link></li>
            <li><Link href="/track-order">Track Dispatch Status</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B68D52', marginBottom: '14px' }}>
            Manufacturer Portal
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13.5px' }}>
            <li><Link href="/admin">Owner Dashboard</Link></li>
            <li><Link href="/admin/upload">Upload New Saree Photo</Link></li>
            <li><Link href="/admin/orders">Manage B2B Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B68D52', marginBottom: '14px' }}>
            Weaving &amp; Dispatch Hubs
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#CBBFB5' }}>
            <li>Madanpura Handloom Cluster, Varanasi, UP</li>
            <li>Ring Road Textile Market, Surat, GJ</li>
            <li>B2B WhatsApp: +91 98765 43210</li>
            <li>orders@vastravanilooms.com</li>
          </ul>
        </div>
      </div>

      <div
        className="container"
        style={{
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          color: '#9C8E83',
        }}
      >
        <span>© 2026 VastraVani Heritage Looms Pvt. Ltd. All rights reserved.</span>
        <span>100% B2B Direct Manufacturer Portal</span>
      </div>
    </footer>
  );
}
