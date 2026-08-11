import { Link } from 'react-router-dom';
import './Services.css';

const services = [
  {
    icon: '\u{1F50D}',
    title: 'PC Diagnostics',
    desc: 'Full system health check — hardware tests, temperature monitoring, and performance benchmarking to find every issue.',
    price: 'From 30 EUR',
    items: ['Hardware failure detection', 'Temperature & voltage analysis', 'Performance benchmarking', 'Boot & POST diagnostics', 'Detailed report with recommendations'],
  },
  {
    icon: '\u{1F4E6}',
    title: 'Hardware Upgrades',
    desc: 'Want more speed? We help you choose and install the right components — RAM, SSD, GPU, CPU, and more.',
    price: 'From 40 EUR + parts',
    items: ['RAM installation & optimization', 'SSD / NVMe upgrade with data migration', 'GPU upgrade & driver setup', 'CPU installation with thermal paste', 'Power supply replacement'],
  },
  {
    icon: '\u{1F6E1}',
    title: 'Virus & Malware Removal',
    desc: 'Complete malware scan, removal, and system hardening. We clean your PC and help prevent future infections.',
    price: 'From 35 EUR',
    items: ['Deep malware & rootkit scanning', 'Browser cleanup & adware removal', 'Firewall configuration', 'Security software setup', 'Safe browsing recommendations'],
  },
  {
    icon: '\u{1F4BE}',
    title: 'Data Recovery',
    desc: 'Lost files? We recover data from failing hard drives, corrupted SSDs, deleted partitions, and formatted drives.',
    price: 'From 50 EUR',
    items: ['Deleted file recovery', 'Formatted drive recovery', 'Failing HDD data extraction', 'Partition repair', 'Backup solution setup'],
  },
  {
    icon: '\u{1F4BB}',
    title: 'OS Installation & Setup',
    desc: 'Clean Windows installation with all drivers, updates, and essential software — ready to use.',
    price: 'From 35 EUR',
    items: ['Fresh Windows installation', 'Driver installation & updates', 'Essential software setup', 'Data backup before reinstall', 'System optimization & tweaks'],
  },
  {
    icon: '\u{1F527}',
    title: 'Custom PC Building',
    desc: 'From parts list to fully assembled — we build your dream PC tailored to your needs and budget.',
    price: 'From 80 EUR',
    items: ['Component selection advice', 'Full assembly & cable management', 'BIOS configuration & updates', 'Stress testing & validation', 'Cable management & aesthetics'],
  },
];

export default function Services() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>Our Services</h1>
        <p>Professional PC repair and upgrade services — we come to you.</p>
      </section>

      <section className="services-grid-section">
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-info">
                <div className="service-header">
                  <h3>{s.title}</h3>
                  <span className="service-price">{s.price}</span>
                </div>
                <p className="service-desc">{s.desc}</p>
                <ul className="service-items">
                  {s.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="services-cta">
        <h2>Ready to Fix Your PC?</h2>
        <p>Contact us today and we&apos;ll schedule a visit at your convenience.</p>
        <Link to="/contact" className="btn btn-primary btn-lg">
          Get in Touch
        </Link>
      </section>
    </div>
  );
}
