import Link from 'next/link';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="bg-mesh"></div>
        <div className="hero-content">
          <h1 className="hero-title font-serif" style={{ marginBottom: '4rem' }}>
            The Fly Bottle <br />
            <span style={{ color: 'var(--accent-secondary)' }}>Circle Coordination.</span>
          </h1>

          <div className="flex gap-4 flex-col md:flex-row">
            <Link href="/admin/login" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Admin Portal
            </Link>
            <Link href="/available/circles" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Browse Circles
            </Link>
            <Link href="/registration" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Propose New Circle
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          right: '-5%',
          top: '-8%',
          width: '40%',
          height: '80%',
          zIndex: 1,
          opacity: 0.15,
          pointerEvents: 'none'
        }}>
          {/* <img src="/hero-bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> */}
        </div>
      </section>


      {/* Footer-like motif */}
      <footer className="text-center mt-12 mb-12" style={{ opacity: 0.5, fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} The Fly Bottle. All rights reserved.</p>
      </footer>
    </div>
  );
}
