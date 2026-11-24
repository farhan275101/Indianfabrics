'use client';

const CARDS = [
  {
    title: 'Everyday poetry',
    sub: 'Light Cottons & Linens',
    category: 'Cotton & Linen',
    image:
      'https://images.pexels.com/photos/235731/pexels-photo-235731.jpeg?auto=compress&cs=tinysrgb&w=1000',
  },
  {
    title: 'Silk stories',
    sub: 'Timeless Banarasi & Zari',
    category: 'Banarasi Silk',
    image:
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    title: 'Celebration edit',
    sub: 'Bridal & Festive Looms',
    category: 'Bridal & Festive',
    image:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=85',
  },
];

export default function CategoryGrid() {
  const selectCategory = (cat: string) => {
    window.dispatchEvent(new CustomEvent('vv-filter-category', { detail: cat }));
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="container" style={{ paddingTop: '68px', paddingBottom: '68px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="eyebrow">The Wholesale Wardrobe</div>
        <h2 className="serif-heading" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
          A saree for every showroom.
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {CARDS.map((card) => (
          <div
            key={card.title}
            onClick={() => selectCategory(card.category)}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                aspectRatio: '3/4',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#eadfd5',
                marginBottom: '12px',
              }}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="serif-heading" style={{ fontSize: '26px', fontWeight: 600 }}>
                  {card.title}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  {card.sub}
                </span>
              </div>
              <span style={{ fontSize: '20px', color: 'var(--accent-red)' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
