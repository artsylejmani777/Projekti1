import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>
            Professional PC Services<br />
            <span className="hero-accent">Right at Your Doorstep</span>
          </h1>
          <p>
            From diagnostics to full system builds — we bring expert computer repair,
            upgrade, and maintenance services directly to your home.
          </p>
          <div className="hero-actions">
            <Link to="/explorer" className="btn btn-primary">
              Explore PC Components
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Book a Service
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">100+</span>
            <span className="stat-label">Repairs Completed</span>
          </div>
          <div className="stat">
            <span className="stat-num">24h</span>
            <span className="stat-label">Fast Turnaround</span>
          </div>
          <div className="stat">
            <span className="stat-num">5&#9733;</span>
            <span className="stat-label">Client Rating</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose PCPro?</h2>
        <p className="section-sub">We make PC repair simple, transparent, and convenient.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">&#127968;</div>
            <h3>At-Home Service</h3>
            <p>No need to unplug and haul your PC — we come to you and fix it on the spot.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#9881;</div>
            <h3>Expert Diagnostics</h3>
            <p>We identify the root cause, not just the symptoms. Full hardware and software analysis.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128640;</div>
            <h3>Performance Upgrades</h3>
            <p>RAM, SSD, GPU upgrades — we help you pick the right parts and install them properly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128737;</div>
            <h3>Virus & Malware Removal</h3>
            <p>Complete system cleanup, malware removal, and security hardening for peace of mind.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-content">
          <h2>Curious What&apos;s Inside Your PC?</h2>
          <p>Use our interactive 3D explorer to learn about every component — CPU, RAM, GPU, and more.</p>
          <Link to="/explorer" className="btn btn-primary btn-lg">
            Launch 3D Explorer
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <p className="section-sub">Three simple steps to get your PC running at its best.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Contact Us</h3>
            <p>Tell us what&apos;s wrong with your PC or what upgrade you need.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>We Visit You</h3>
            <p>We arrive at your home with all the tools and parts needed.</p>
          </div>
          <div className="step-arrow">&rarr;</div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Problem Solved</h3>
            <p>Your PC is diagnosed, repaired, or upgraded — all in one visit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
