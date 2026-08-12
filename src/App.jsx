import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Explorer from './pages/Explorer.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Order from './pages/Order.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/services" element={<Services />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
