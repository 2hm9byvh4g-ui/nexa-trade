'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = ['Agriculture', 'Industrial', 'Machinery', 'Renewable Energy', 'Packaging'];

export default function SupplierProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Agriculture',
    location: 'Kano, Nigeria',
    quantity: '',
    moq: '',
    quality: 'Export grade',
    certificates: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('nexaTradeUser');
    if (!stored) {
      router.push('/auth');
      return;
    }

    const userData = JSON.parse(stored);
    if (userData.role !== 'supplier') {
      router.push('/dashboard');
      return;
    }

    setUser(userData);
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificateToggle = (cert) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.includes(cert)
        ? prev.certificates.filter(c => c !== cert)
        : [...prev.certificates, cert]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.quantity || !formData.moq) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: user.id || 'sup_' + Math.random().toString(36).substr(2, 9),
          name: formData.name,
          category: formData.category,
          location: formData.location,
          quantity: formData.quantity,
          moq: formData.moq,
          quality: formData.quality,
          certificates: formData.certificates.length > 0 ? formData.certificates : ['Certificate of origin']
        })
      });

      if (response.ok) {
        setFormData({
          name: '',
          category: 'Agriculture',
          location: 'Kano, Nigeria',
          quantity: '',
          moq: '',
          quality: 'Export grade',
          certificates: []
        });
        setShowForm(false);
        fetchProducts();
      }
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error('Error:', err);
    }
  };

  if (!user || user.role !== 'supplier') {
    return null;
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <a className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>NEXA <b>TRADE</b></span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Overview</span>
          <a href="/dashboard">Dashboard</a>
          <a className="active" href="/products">Products</a>
          <a href="/buying-requests">Buyer requests</a>
          <a href="/messages">Messages</a>
          <a href="/verification">Verification</a>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">SUPPLIER PORTAL</p>
            <h1>Product listings</h1>
          </div>
          <button className="button" onClick={() => setShowForm(!showForm)} type="button">
            {showForm ? 'Cancel' : '+ Add product'}
          </button>
        </header>

        {showForm && (
          <section className="form-panel">
            <h2>List a new product</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Product name *
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium Dried Ginger"
                  />
                </label>

                <label>
                  Category *
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </label>

                <label>
                  Location *
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Kaduna, Nigeria"
                  />
                </label>

                <label>
                  Available quantity *
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 50 tonnes"
                  />
                </label>

                <label>
                  Minimum order quantity *
                  <input
                    type="text"
                    name="moq"
                    value={formData.moq}
                    onChange={handleInputChange}
                    placeholder="e.g. 5 tonnes"
                  />
                </label>

                <label>
                  Quality standard *
                  <input
                    type="text"
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    placeholder="e.g. Export grade"
                  />
                </label>
              </div>

              <label className="cert-label">
                <span>Available certificates</span>
                <div className="cert-grid">
                  {['Certificate of origin', 'Phytosanitary', 'Inspection report', 'Quality test'].map(cert => (
                    <button
                      key={cert}
                      type="button"
                      className={formData.certificates.includes(cert) ? 'cert-tag active' : 'cert-tag'}
                      onClick={() => handleCertificateToggle(cert)}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </label>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="button">List product</button>
            </form>
          </section>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products listed yet.</p>
            <button className="button" onClick={() => setShowForm(true)}>Add your first product</button>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Available</th>
                  <th>MOQ</th>
                  <th>Quality</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.location}</td>
                    <td>{product.quantity}</td>
                    <td>{product.moq}</td>
                    <td>{product.quality}</td>
                    <td><span className="badge-status approved">{product.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
