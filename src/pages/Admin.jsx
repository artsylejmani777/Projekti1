import { useState, useEffect, useCallback } from 'react';
import './Admin.css';

const SB_URL = 'https://dbuggsvlkytaxkbwwdzq.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_obrjP8dKPrQE814rbrJwfA_rxEsjRNc';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
};

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch(`${SB_URL}/products?select=*&order=id`, { headers: HEADERS }),
        fetch(`${SB_URL}/orders?select=*&order=id.desc`, { headers: HEADERS }),
      ]);
      if (!pRes.ok || !oRes.ok) throw new Error('Failed to fetch data');
      setProducts(await pRes.json());
      setOrders(await oRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const lowStock = products.filter(p => p.stock <= 5).length;

  const updateOrderStatus = async (id, status) => {
    await fetch(`${SB_URL}/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    await fetch(`${SB_URL}/products`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(data),
    });
    e.target.reset();
    fetchData();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${SB_URL}/products?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    fetchData();
  };

  const updateStock = async (id, stock) => {
    await fetch(`${SB_URL}/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({ stock: Number(stock) }),
    });
    fetchData();
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <nav className="admin-tabs">
          {['dashboard','products','orders'].map(t => (
            <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="admin-error">Error: {error}</div>}

      {/* ─── DASHBOARD ─── */}
      {tab === 'dashboard' && (
        <div className="dashboard">
          <div className="stat-cards">
            <div className="stat-card"><span className="sc-num">{orders.length}</span><span className="sc-label">Total Orders</span></div>
            <div className="stat-card"><span className="sc-num">{totalRevenue.toFixed(0)} EUR</span><span className="sc-label">Revenue</span></div>
            <div className="stat-card"><span className="sc-num">{pendingOrders}</span><span className="sc-label">Pending</span></div>
            <div className="stat-card alert"><span className="sc-num">{lowStock}</span><span className="sc-label">Low Stock</span></div>
          </div>

          <div className="dash-section">
            <h3>Recent Orders</h3>
            <table className="admin-table">
              <thead><tr><th>#</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.slice(0, 10).map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td><td>{o.customer_name}</td><td>{o.product_name}</td>
                    <td>{Number(o.total_price).toFixed(0)} EUR</td>
                    <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-section">
            <h3>Stock Alerts</h3>
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
              <tbody>
                {products.filter(p=>p.stock<=5).map(p=>(
                  <tr key={p.id} className="low-stock-row">
                    <td>{p.name}</td><td>{p.category}</td>
                    <td>{Number(p.price)} EUR</td>
                    <td className="stock-low">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PRODUCTS ─── */}
      {tab === 'products' && (
        <div className="admin-products">
          <div className="ap-grid">
            <div className="ap-form-wrap">
              <h3>Add Product</h3>
              <form onSubmit={addProduct} className="ap-form">
                <input name="name" placeholder="Product name" required />
                <input name="category" placeholder="Category (Memory, Storage, Graphics...)" required />
                <input name="price" type="number" step="0.01" placeholder="Price (EUR)" required />
                <input name="stock" type="number" placeholder="Stock qty" required />
                <textarea name="description" placeholder="Description" rows={2} />
                <button type="submit" className="btn btn-primary">Add Product</button>
              </form>
            </div>
            <div className="ap-list">
              <h3>All Products ({products.length})</h3>
              <div className="ap-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={p.stock <= 5 ? 'low-stock-row' : ''}>
                        <td>{p.id}</td><td>{p.name}</td><td>{p.category}</td>
                        <td>{Number(p.price)} EUR</td>
                        <td><StockEditor id={p.id} stock={p.stock} onUpdate={updateStock} /></td>
                        <td><button className="btn-del" onClick={()=>deleteProduct(p.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDERS ─── */}
      {tab === 'orders' && (
        <div className="admin-orders">
          <h3>All Orders ({orders.length})</h3>
          <div className="ao-table-wrap">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Customer</th><th>Email</th><th>Phone</th><th>Address</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td><td>{o.customer_name}</td><td>{o.email}</td><td>{o.phone}</td>
                    <td>{o.address}</td><td>{o.product_name}</td><td>{o.quantity}</td>
                    <td>{Number(o.total_price).toFixed(0)} EUR</td>
                    <td>
                      <select value={o.status} onChange={e=>updateOrderStatus(o.id, e.target.value)}
                        className={`status-select ${o.status.toLowerCase()}`}>
                        <option>Pending</option><option>Confirmed</option><option>Delivered</option><option>Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StockEditor({ id, stock, onUpdate }) {
  const [val, setVal] = useState(stock);
  return (
    <span className="stock-editor">
      <input type="number" value={val} onChange={e=>setVal(e.target.value)}
        className="stock-input" min="0" />
      <button onClick={()=>onUpdate(id, val)} className="stock-save">Save</button>
    </span>
  );
}
