import { useState, useEffect } from 'react';
import './Order.css';

const SB_URL = 'https://dbuggsvlkytaxkbwwdzq.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_obrjP8dKPrQE814rbrJwfA_rxEsjRNc';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
};

const emptyForm = {
  customer_name: '', email: '', phone: '', address: '',
  product_id: '', product_name: '', quantity: 1, total_price: 0, notes: '',
};

export default function Order() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${SB_URL}/products?select=*&order=category,name`, { headers: HEADERS })
      .then(r => {
        if (!r.ok) throw new Error('Products table not ready');
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'product_id') {
        const prod = products.find(p => String(p.id) === value);
        updated.product_name = prod ? prod.name : '';
        updated.total_price = prod ? Number(prod.price) * (Number(updated.quantity) || 1) : 0;
      }
      if (name === 'quantity') {
        const prod = products.find(p => String(p.id) === updated.product_id);
        updated.total_price = prod ? Number(prod.price) * (Number(value) || 0) : 0;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!form.product_id) { setError('Please select a product.'); return; }
    if (form.quantity < 1) { setError('Quantity must be at least 1.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${SB_URL}/orders`, {
        method: 'POST',
        headers: { ...HEADERS, 'Prefer': 'return=representation' },
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
      setError(err.message || 'Could not connect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <section className="order-hero">
        <h1>Order PC Parts</h1>
        <p>Browse our live catalog, select your parts, and we'll deliver and install them at your home.</p>
      </section>

      <section className="order-content">
        <div className="order-grid">
          <div className="order-form-wrap">
            {result ? (
              <div className="order-success">
                <div className="success-icon">&#10003;</div>
                <h2>Order Placed!</h2>
                <p>Order <strong>#{result.id}</strong> for <strong>{result.product_name}</strong> has been registered.</p>
                <div className="order-details-card">
                  <div className="od-row"><span>Customer</span><span>{result.customer_name}</span></div>
                  <div className="od-row"><span>Product</span><span>{result.product_name}</span></div>
                  <div className="od-row"><span>Quantity</span><span>{result.quantity}x</span></div>
                  <div className="od-row"><span>Total</span><span className="od-price">{Number(result.total_price).toFixed(2)} EUR</span></div>
                  <div className="od-row"><span>Status</span><span className="od-status pending">{result.status}</span></div>
                  <div className="od-row"><span>Date</span><span>{new Date(result.created_at).toLocaleString()}</span></div>
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
                  <label htmlFor="part_search">Search Products</label>
                  <input id="part_search" type="text"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to filter by name or category..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product_id">Select Product *</label>
                    {productsLoading ? (
                      <p className="form-hint">Loading products...</p>
                    ) : products.length === 0 ? (
                      <div className="form-hint" style={{padding:'16px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'var(--radius-sm)'}}>
                        <strong>Products database not ready yet.</strong><br />
                        Run <code>supabase-schema.sql</code> in your Supabase SQL editor to populate the catalog.
                      </div>
                    ) : (
                      <select id="product_id" name="product_id" required
                        value={form.product_id} onChange={handleChange} size={8}>
                        <option value="">-- Choose a product --</option>
                        {filteredProducts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {Number(p.price)} EUR ({p.stock} in stock)
                          </option>
                        ))}
                      </select>
                    )}
                    {!productsLoading && products.length > 0 && filteredProducts.length === 0 && (
                      <span className="form-hint">No products match your search.</span>
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
                  disabled={loading || productsLoading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar catalog */}
          <div className="order-catalog">
            <div className="catalog-card">
              <h3>Live Catalog</h3>
              <p className="catalog-sub">All prices include delivery &amp; installation</p>
              {productsLoading ? (
                <p className="form-hint">Loading...</p>
              ) : products.length === 0 ? (
                <div className="form-hint" style={{padding:'12px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'var(--radius-sm)',fontSize:'0.82rem'}}>
                  Run <code>supabase-schema.sql</code> in Supabase SQL editor.
                </div>
              ) : (
                <div className="catalog-list">
                  {products.map(p => (
                    <div key={p.id}
                      className={`catalog-item${String(form.product_id) === String(p.id) ? ' selected' : ''}${p.stock <= 0 ? ' out-of-stock' : ''}`}
                      onClick={() => {
                        if (p.stock <= 0) return;
                        setForm(prev => ({
                          ...prev,
                          product_id: String(p.id),
                          product_name: p.name,
                          total_price: Number(p.price) * (Number(prev.quantity) || 1),
                        }));
                      }}>
                      <div>
                        <span className="catalog-name">{p.name}</span>
                        <span className="catalog-cat">{p.category}</span>
                      </div>
                      <div className="catalog-right">
                        <span className="catalog-price">{Number(p.price)} EUR</span>
                        <span className={`catalog-stock ${p.stock <= 5 ? 'low' : ''}`}>
                          {p.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
