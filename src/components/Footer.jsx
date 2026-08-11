import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span style={{color:'var(--accent)'}}>&#9881;</span> PC<span style={{color:'var(--accent)'}}>Pro</span>
          </div>
          <p>Professional PC diagnostics, repair, and upgrade services — right at your doorstep.</p>
        </div>
        <div className="footer-col">
          <h4>Pages</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explorer">3D Explorer</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li><Link to="/services">PC Diagnostics</Link></li>
            <li><Link to="/services">Hardware Upgrade</Link></li>
            <li><Link to="/services">Virus Removal</Link></li>
            <li><Link to="/services">Data Recovery</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} PCPro. All rights reserved.</span>
        <span>Built for home service excellence</span>
      </div>
    </footer>
  );
}
