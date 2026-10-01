'use client';

import { useEffect, useState } from 'react';

const initialStats = {
  totalSuppliers: 0,
  totalBuyers: 0,
  totalProducts: 0,
  totalRFQs: 0,
  verifiedSuppliers: 0,
  openMatches: 0
};

export default function AdminPage() {
  const [stats, setStats] = useState(initialStats);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [buyers, setBuyers] = useState([]);

  const fetchData = async () => {
    try {
      const [summaryRes, suppliersRes, buyersRes, requestsRes] = await Promise.all([
        fetch('http://localhost:4000/api/dashboard-summary'),
        fetch('http://localhost:4000/api/suppliers'),
        fetch('http://localhost:4000/api/buyers'),
        fetch('http://localhost:4000/api/verification-requests')
      ]);

      const summary = await summaryRes.json();
      const supplierData = await suppliersRes.json();
      const buyerData = await buyersRes.json();
      const requestData = await requestsRes.json();

      setStats(summary);
      setSuppliers(supplierData);
      setBuyers(buyerData);
      setRequests(requestData);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/verification-requests/${id}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to approve verification', error);
    }
  };

  return (
    <main className="dashboard-shell admin-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <a className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>NEXA <b>TRADE</b></span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Admin</span>
          <a className="active" href="/admin">Overview</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/verification">Verification</a>
          <a href="/admin/reports">Reports</a>
          <a href="/admin/logs">Audit logs</a>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">ADMIN CONSOLE</p>
            <h1>Platform oversight</h1>
          </div>
        </header>

        <div className="overview-grid">
          <article className="stat-card"><span>Suppliers</span><strong>{stats.totalSuppliers}</strong></article>
          <article className="stat-card"><span>Buyers</span><strong>{stats.totalBuyers}</strong></article>
          <article className="stat-card"><span>Products</span><strong>{stats.totalProducts}</strong></article>
          <article className="stat-card"><span>Open RFQs</span><strong>{stats.totalRFQs}</strong></article>
          <article className="stat-card"><span>Verified suppliers</span><strong>{stats.verifiedSuppliers}</strong></article>
          <article className="stat-card"><span>Open matches</span><strong>{stats.openMatches}</strong></article>
        </div>

        <div className="panel-grid admin-grid">
          <section className="panel">
            <div className="panel-header">
              <h3>Verification queue</h3>
              <span>Pending</span>
            </div>

            <div className="admin-list">
              {requests.length === 0 ? (
                <p>No verification requests.</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="admin-row">
                    <div>
                      <strong>{request.entityType}</strong>
                      <small>{request.notes}</small>
                    </div>
                    <span className={`admin-status ${request.status}`}>{request.status}</span>
                    {request.status === 'pending' && (
                      <button className="button small" onClick={() => handleApprove(request.id)} type="button">
                        Approve
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>Registered users</h3>
              <span>Live</span>
            </div>

            <div className="user-lists">
              <div>
                <h4>Suppliers</h4>
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="user-row">
                    <strong>{supplier.company}</strong>
                    <span>{supplier.verificationLevel}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4>Buyers</h4>
                {buyers.map((buyer) => (
                  <div key={buyer.id} className="user-row">
                    <strong>{buyer.company}</strong>
                    <span>{buyer.verificationLevel}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
