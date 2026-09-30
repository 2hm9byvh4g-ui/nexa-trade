const products = [
  { name: 'Dried Hibiscus Flowers', category: 'Agriculture', location: 'Kano, Nigeria', quantity: '20 tonnes', moq: '5 tonnes', tag: 'Export grade', accent: 'rose' },
  { name: 'Premium Dried Ginger', category: 'Agriculture', location: 'Kaduna, Nigeria', quantity: '50 tonnes', moq: '5 tonnes', tag: 'Certificates available', accent: 'gold' },
  { name: 'Cleaned Sesame Seeds', category: 'Agriculture', location: 'Kebbi, Nigeria', quantity: '100 tonnes', moq: '10 tonnes', tag: 'Ready to ship', accent: 'green' }
];

const steps = [
  ['01', 'Verify', 'Know who you are dealing with. Every supplier profile shows exactly what has been checked.'],
  ['02', 'Match', 'Turn a buying request into relevant offers from Nigerian suppliers.'],
  ['03', 'Transact', 'Compare quotes, communicate securely and keep a clear record of the deal.'],
  ['04', 'Track', 'Keep documents, milestones and participants organised from request to delivery.']
];

function Badge({ children, tone = 'green' }) { return <span className={`badge ${tone}`}>{children}</span>; }

export default function Home() {
  return <main>
    <nav className="nav shell">
      <a className="brand" href="#top"><span className="brand-mark">N</span><span>NEXA <b>TRADE</b></span></a>
      <div className="nav-links"><a href="#marketplace">Marketplace</a><a href="#how-it-works">How it works</a><a href="#requests">Buying requests</a></div>
      <div className="nav-actions"><a className="login" href="#login">Log in</a><a className="button small" href="#register">Get started <span>↗</span></a></div>
    </nav>

    <section className="hero shell" id="top">
      <div className="hero-copy"><Badge>🇳🇬 Built for Nigerian supply</Badge><h1>From Nigerian<br /><em>supply</em> to global demand.</h1><p className="lead">A trusted B2B trade platform connecting verified Nigerian suppliers with serious international buyers.</p><div className="hero-buttons"><a className="button" href="#register">Start trading <span>↗</span></a><a className="text-button" href="#how-it-works">See how it works <span>→</span></a></div><div className="trust-row"><div className="avatars"><i>AB</i><i>KO</i><i>MS</i><i>+</i></div><span>Join 120+ verified businesses</span></div></div>
      <div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="map-card"><div className="map-grid"></div><div className="pin pin-one"><b>Hibiscus</b><small>Kano</small></div><div className="pin pin-two"><b>Ginger</b><small>Kaduna</small></div><div className="pin pin-three"><b>Sesame</b><small>Kebbi</small></div><div className="nigeria-shape">✦</div><div className="global-label">NIGERIA <span>→</span> THE WORLD</div></div></div>
    </section>

    <section className="stats"><div className="shell stats-grid"><div><strong>120+</strong><span>Verified suppliers</span></div><div><strong>18</strong><span>Product categories</span></div><div><strong>14</strong><span>Countries reached</span></div><div><strong>₦2.4B</strong><span>Supply listed</span></div></div></section>

    <section className="section shell" id="how-it-works"><div className="eyebrow">THE NEXA WAY</div><div className="section-head"><h2>Trade with confidence.</h2><p>We make it easier to discover, verify and source from Nigeria—without the guesswork.</p></div><div className="steps">{steps.map(([number, title, text]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="market shell" id="marketplace"><div className="market-head"><div><div className="eyebrow">DISCOVER SUPPLY</div><h2>What can Nigeria<br /><em>offer you?</em></h2></div><a className="text-button" href="#all-products">Explore marketplace <span>→</span></a></div><div className="product-grid">{products.map(product => <article className="product-card" key={product.name}><div className={`product-image ${product.accent}`}><span>{product.accent === 'rose' ? '✿' : product.accent === 'gold' ? '✦' : '◉'}</span><b>NIGERIA</b></div><div className="product-body"><div className="card-top"><Badge>{product.category}</Badge><span className="save">♡</span></div><h3>{product.name}</h3><p className="location">⌖ {product.location}</p><div className="product-details"><span><small>Available</small><b>{product.quantity}</b></span><span><small>MOQ</small><b>{product.moq}</b></span></div><div className="card-bottom"><Badge>{product.tag}</Badge><a href="#quote">View product →</a></div></div></article>)}</div></section>

    <section className="rfq shell" id="requests"><div className="rfq-copy"><div className="eyebrow light">FOR INTERNATIONAL BUYERS</div><h2>Tell Nigeria<br />what you <em>need.</em></h2><p>Post a buying request and let verified suppliers come to you. Compare offers in one place.</p><a className="button light-button" href="#post-request">Post a buying request <span>↗</span></a></div><div className="request-card"><div className="request-top"><span className="status-dot"></span><span>OPEN BUYING REQUEST</span><span className="more">•••</span></div><h3>Premium dried ginger</h3><div className="request-grid"><span><small>Quantity</small><b>100 tonnes</b></span><span><small>Destination</small><b>Shanghai, China</b></span><span><small>Quality</small><b>Export grade</b></span><span><small>Delivery</small><b>CIF · 30 days</b></span></div><div className="match"><strong>7</strong><span>verified suppliers match this request<br /><small>Last updated 2 hours ago</small></span><span className="arrow">→</span></div></div></section>

    <footer className="footer"><div className="shell footer-grid"><div><a className="brand" href="#top"><span className="brand-mark">N</span><span>NEXA <b>TRADE</b></span></a><p>Connecting Nigerian supply<br />with global demand.</p></div><div><b>Platform</b><a href="#marketplace">Marketplace</a><a href="#requests">Buying requests</a><a href="#how-it-works">How it works</a></div><div><b>Company</b><a href="#about">About NEXA</a><a href="#contact">Contact us</a><a href="#trust">Trust & safety</a></div><div><b>Get started</b><a href="#register">I'm a supplier</a><a href="#register">I'm a buyer</a><a href="#login">Sign in</a></div></div><div className="shell footer-bottom"><span>© 2026 NEXA Trade</span><span>VERIFY → MATCH → TRANSACT → TRACK</span></div></footer>
  </main>;
}
