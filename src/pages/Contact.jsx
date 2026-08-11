import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', issue: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const issues = [
    'PC won\'t turn on',
    'Slow performance',
    'Blue screen / crashes',
    'Virus or malware',
    'Hardware upgrade',
    'Custom PC build',
    'Data recovery',
    'Other',
  ];

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Get in Touch</h1>
        <p>Tell us what&apos;s going on with your PC and we&apos;ll get back to you within 24 hours.</p>
      </section>

      <section className="contact-content">
        <div className="contact-grid">
          {/* Form */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon">&#10003;</div>
                <h2>Thank You!</h2>
                <p>We&apos;ve received your request and will contact you shortly to schedule a visit.</p>
                <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', issue: '', message: '' }); }}>
                  Send Another Request
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name" name="name" type="text"
                      required placeholder="Your name"
                      value={form.name} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email" name="email" type="email"
                      required placeholder="your@email.com"
                      value={form.email} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone" name="phone" type="tel"
                      placeholder="+355 69 123 4567"
                      value={form.phone} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="issue">Issue Type *</label>
                    <select
                      id="issue" name="issue"
                      required value={form.issue} onChange={handleChange}
                    >
                      <option value="">Select an issue...</option>
                      {issues.map((iss, i) => (
                        <option key={i} value={iss}>{iss}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Describe the Problem</label>
                  <textarea
                    id="message" name="message"
                    rows={5}
                    placeholder="Tell us what's happening with your PC..."
                    value={form.message} onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Send Request
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="contact-info-sidebar">
            <div className="contact-info-card">
              <h3>Contact Info</h3>
              <div className="contact-info-item">
                <span className="ci-icon">&#128222;</span>
                <div>
                  <strong>Phone</strong>
                  <p>+355 69 123 4567</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="ci-icon">&#9993;</span>
                <div>
                  <strong>Email</strong>
                  <p>info@pcpro.al</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="ci-icon">&#128205;</span>
                <div>
                  <strong>Service Area</strong>
                  <p>Tirana & surrounding areas</p>
                </div>
              </div>
            </div>

            <div className="contact-info-card">
              <h3>Working Hours</h3>
              <div className="hours-list">
                <div className="hours-row"><span>Mon &mdash; Fri</span><span>9:00 &mdash; 19:00</span></div>
                <div className="hours-row"><span>Saturday</span><span>10:00 &mdash; 16:00</span></div>
                <div className="hours-row"><span>Sunday</span><span>Closed</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
