import { useState } from 'react';
import './Order.css';

const PC_PARTS = [
  { name: 'RAM DDR5 16GB (2x8GB)', price: 55 },
  { name: 'RAM DDR5 32GB (2x16GB)', price: 105 },
  { name: 'RAM DDR4 16GB (2x8GB)', price: 35 },
  { name: 'SSD NVMe M.2 1TB', price: 65 },
  { name: 'SSD NVMe M.2 2TB', price: 120 },
  { name: 'SSD SATA 1TB', price: 50 },
  { name: 'CPU Cooler (Air)', price: 35 },
  { name: 'CPU Cooler (AIO Liquid)', price: 90 },
  { name: 'PSU 650W 80+ Gold', price: 80 },
  { name: 'PSU 750W 80+ Gold', price: 105 },
  { name: 'PSU 850W 80+ Gold', price: 135 },
  { name: 'GPU RTX 4060', price: 299 },
  { name: 'GPU RTX 4070', price: 549 },
  { name: 'GPU RTX 4080', price: 999 },
  { name: 'CPU Intel i5-14600K', price: 280 },
  { name: 'CPU Intel i7-14700K', price: 389 },
  { name: 'CPU AMD Ryzen 7 7800X3D', price: 369 },
  { name: 'CPU AMD Ryzen 5 7600X', price: 219 },
  { name: 'Motherboard Z790', price: 220 },
  { name: 'Motherboard B650', price: 165 },
  { name: 'Case Mid-Tower ATX', price: 75 },
  { name: 'Case Full-Tower ATX', price: 130 },
  { name: 'Thermal Paste', price: 8 },
  { name: 'Case Fans (3-Pack)', price: 25 },
];

const emptyForm = {
  customer_name: '', email: '', phone: '', address: '',
  part_name: '', quantity: 1, total_price: 0, notes: '',
};

export default function Order() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const filteredParts = PC_PARTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calc total when part or quantity changes
      if (name === 'part_name') {
        const part = PC_PARTS.find(p => p.name === value);
        updated.total_price = part ? part.price * (Number(updated.quantity) || 1) : 0;
      }
      if (name === 'quantity') {
        const part = PC_PARTS.find(p => p.name === updated.part_name);
        updated.total_price = part ? part.price * (Number(value) || 0) : 0;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!form.part_name) { setError('Please select a PC part.'); return; }
    if (form.quantity < 1) { setError('Quantity must be at least 1.'); return; }

    setLoading(true);
    try {
      const SUPABASE_URL = 'https://dbuggsvlkytaxkbwwdzq.supabase.co/rest/v1/orders';
      const SUPABASE_KEY = 'sb_publishable_obrjP8dKPrQE814rbrJwfA_rxEsjRNc';

      const res = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to place order');
      }
      const rows = await res.json();
      setResult(rows[0]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <section className="order-hero">
        <h1>Order PC Parts</h1>
        <p>Browse our catalog, select your parts, and we&apos;ll deliver and install them at your home.</p>
      </section>

      <section className="order-content">
        <div className="order-grid">
          {/* Order Form */}
          <div className="order-form-wrap">
            {result ? (
              <div className="order-success">
                <div className="success-icon">&#10003;</div>
                <h2>Order Placed!</h2>
                <p>Order <strong>#{result.id}</strong> for <strong>{result.part_name}</strong> has been registered.</p>
                <div className="order-details-card">
                  <div className="od-row"><span>Customer</span><span>{result.customer_name}</span></div>
                  <div className="od-row"><span>Part</span><span>{result.part_name}</span></div>
                  <div className="od-row"><span>Quantity</span><span>{result.quantity}x</span></div>
                  <div className="od-row"><span>Total</span><span className="od-price">{result.total_price.toFixed(2)} EUR</span></div>
                  <div className="od-row"><span>Status</span><span className="od-status pending">{result.status}</span></div>
                  <div className="od-row"><span>Date</span><span>{result.created_at}</span></div>
                </div>
                <button className="btn btn-primary" onClick={() => setResult(null)}>
                  Place Another Order
                </button>
              </div>
            ) : (
              <form className="order-form" onSubmit={handleSubmit}>
                <h3>Customer Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer_name">Full Name *</label>
                    <input id="customer_name" name="customer_name" required
                      value={form.customer_name} onChange={handleChange}
                      placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      placeholder="your@email.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input id="phone" name="phone" type="tel" required
                      value={form.phone} onChange={handleChange}
                      placeholder="+355 69 123 4567" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <input id="address" name="address" required
                      value={form.address} onChange={handleChange}
                      placeholder="Street, City" />
                  </div>
                </div>

                <h3>Order Details</h3>
                <div className="form-group">
                  <label htmlFor="part_search">Search Parts</label>
                  <input id="part_search" type="text"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to filter parts..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="part_name">Select Part *</label>
                    <select id="part_name" name="part_name" required
                      value={form.part_name} onChange={handleChange}
                      size={6}>
                      <option value="">-- Choose a part --</option>
                      {filteredParts.map((p, i) => (
                        <option key={i} value={p.name}>
                          {p.name} — {p.price} EUR
                        </option>
                      ))}
                    </select>
                    {filteredParts.length === 0 && (
                      <span className="form-hint">No parts match your search.</span>
                    )}
                  </div>
                  <div className="form-group form-group-narrow">
                    <label htmlFor="quantity">Quantity</label>
                    <input id="quantity" name="quantity" type="number" min="1" max="20"
                      value={form.quantity} onChange={handleChange} />
                    {form.total_price > 0 && (
                      <div className="price-preview">
                        Total: <strong>{form.total_price.toFixed(2)} EUR</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes (optional)</label>
                  <textarea id="notes" name="notes" rows={3}
                    value={form.notes} onChange={handleChange}
                    placeholder="Any special requests or questions..." />
                </div>

                {error && <div className="form-error">{error}</div>}

                <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}}
                  disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar — Parts Catalog */}
          <div className="order-catalog">
            <div className="catalog-card">
              <h3>Parts Catalog</h3>
              <p className="catalog-sub">All prices include delivery &amp; installation</p>
              <div className="catalog-list">
                {PC_PARTS.map((p, i) => (
                  <div key={i}
                    className={`catalog-item${form.part_name === p.name ? ' selected' : ''}`}
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        part_name: p.name,
                        total_price: p.price * (Number(prev.quantity) || 1),
                      }));
                    }}>
                    <span className="catalog-name">{p.name}</span>
                    <span className="catalog-price">{p.price} EUR</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
