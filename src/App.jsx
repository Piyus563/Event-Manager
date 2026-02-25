import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Global Tech Summit 2026",
    date: "March 15-17, 2026",
    location: "Tokyo, Japan / Virtual",
    category: "Technology",
    price: 1499,
    isPaid: true,
    image: "https://images.unsplash.com/photo-1540575861501-7ad058138a31?auto=format&fit=crop&q=80&w=800",
    description: "The world's leading technology conference for innovators and creators."
  },
  {
    id: 2,
    title: "Eco-Innovation Forum",
    date: "April 22, 2026",
    location: "Stockholm, Sweden",
    category: "Sustainability",
    price: 999,
    isPaid: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    description: "Designing the future of sustainable enterprise and environmental protection."
  },
  {
    id: 3,
    title: "Modern Art Expo",
    date: "May 10-25, 2026",
    location: "New York, USA",
    category: "Art",
    price: 799,
    isPaid: true,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    description: "A comprehensive showcase of digital and traditional modern art from global artists."
  },
  {
    id: 4,
    title: "Community Meetup 2026",
    date: "June 5, 2026",
    location: "Mumbai, India",
    category: "Technology",
    price: 0,
    isPaid: false,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800",
    description: "Free community gathering for tech enthusiasts and developers."
  },
  {
    id: 5,
    title: "Startup Pitch Night",
    date: "July 12, 2026",
    location: "Bangalore, India",
    category: "Business",
    price: 499,
    isPaid: true,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800",
    description: "Pitch your startup ideas to investors and mentors."
  },
  {
    id: 6,
    title: "Music Festival 2026",
    date: "August 20-22, 2026",
    location: "Goa, India",
    category: "Art",
    price: 1999,
    isPaid: true,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800",
    description: "Three days of live music, art, and culture by the beach."
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [registrations, setRegistrations] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', category: 'Technology', date: '', location: '', description: '', image: '', price: '', isPaid: true });
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to Evento! Explore trending events now.", time: "Just now" }
  ]);
  const [teams, setTeams] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userDetails, setUserDetails] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentEventForCard, setCurrentEventForCard] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentEventForPayment, setCurrentEventForPayment] = useState(null);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleAuth = () => {
    if (user) {
      setUser(null);
      addNotification("Signed out successfully.");
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const joinTeam = (eventId) => {
    const teamName = prompt("Enter team name to join or create:");
    if (!teamName) return;

    setTeams(prev => {
      const currentTeam = prev[eventId] || { teamName, members: ["You"] };
      if (currentTeam.teamName !== teamName) {
        return { ...prev, [eventId]: { teamName, members: [teamName, "You"] } };
      }
      return { ...prev, [eventId]: { ...currentTeam, members: [...currentTeam.members, "You"] } };
    });
    addNotification(`Joined team "${teamName}" for event.`);
  };

  const addNotification = (text) => {
    setNotifications([{ id: Date.now(), text, time: "Just now" }, ...notifications].slice(0, 5));
  };

  const handleRegister = (event) => {
    if (registrations.find(r => r.id === event.id)) {
      alert("You are already registered for this event!");
      return;
    }
    if (event.isPaid) {
      setCurrentEventForPayment(event);
      setShowPaymentModal(true);
    } else {
      const registration = {
        ...event,
        registrationId: `EVT-${Date.now()}`,
        registeredAt: new Date().toLocaleString(),
        paymentDetails: { method: 'Free', amount: 0 }
      };
      setRegistrations([...registrations, registration]);
      addNotification(`Successfully registered for ${event.title}!`);
      alert(`Successfully registered for ${event.title}!`);
    }
  };

  const handlePaymentSuccess = (paymentDetails) => {
    const registration = {
      ...currentEventForPayment,
      registrationId: `EVT-${Date.now()}`,
      registeredAt: new Date().toLocaleString(),
      paymentDetails
    };
    setRegistrations([...registrations, registration]);
    addNotification(`Payment confirmed! Successfully registered for ${currentEventForPayment.title}!`);
    setShowPaymentModal(false);
    setCurrentEventForPayment(null);
  };

  const generatePDF = async (event) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text('EVENTO', 105, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Event Registration Confirmation', 105, 30, { align: 'center' });
    
    // Content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('Registration Details', 20, 55);
    
    pdf.setFontSize(11);
    pdf.text(`Registration ID: ${event.registrationId}`, 20, 70);
    pdf.text(`Date: ${event.registeredAt}`, 20, 80);
    
    pdf.setFontSize(14);
    pdf.text('Event Information', 20, 100);
    
    pdf.setFontSize(11);
    pdf.text(`Event: ${event.title}`, 20, 115);
    pdf.text(`Date: ${event.date}`, 20, 125);
    pdf.text(`Location: ${event.location}`, 20, 135);
    pdf.text(`Category: ${event.category}`, 20, 145);
    
    pdf.setFontSize(10);
    const desc = pdf.splitTextToSize(event.description, 170);
    pdf.text(desc, 20, 160);
    
    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 260, 210, 37, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Thank you for registering with Evento!', 105, 275, { align: 'center' });
    pdf.text('Please present this confirmation at the event venue.', 105, 283, { align: 'center' });
    
    pdf.save(`${event.title.replace(/\s+/g, '_')}_Confirmation.pdf`);
    addNotification('PDF confirmation downloaded successfully!');
  };

  const generateICCard = async (event) => {
    if (!userDetails[event.id]) {
      setCurrentEventForCard(event);
      setShowDetailsModal(true);
      return;
    }
    
    const cardElement = document.getElementById(`ic-card-${event.id}`);
    if (!cardElement) return;
    
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: '#1a1a2e'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
    pdf.save(`${event.title.replace(/\s+/g, '_')}_IC_Card.pdf`);
    addNotification('IC Card downloaded successfully!');
  };

  const saveUserDetails = (details) => {
    setUserDetails({ ...userDetails, [currentEventForCard.id]: details });
    setShowDetailsModal(false);
    setTimeout(() => generateICCard(currentEventForCard), 100);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const event = {
      ...newEvent,
      id: events.length + 1,
      price: newEvent.isPaid ? (parseInt(newEvent.price) || 999) : 0,
      isPaid: newEvent.isPaid,
      image: newEvent.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', category: 'Technology', date: '', location: '', description: '', image: '', price: '', isPaid: true });
    addNotification(`New Event Created: ${event.title}`);
    alert("Event created successfully!");
  };

  const deleteEvent = (id) => {
    const event = events.find(e => e.id === id);
    setEvents(events.filter(e => e.id !== id));
    addNotification(`Event Cancelled: ${event?.title}`);
  };

  return (
    <div className="app">
      <nav>
        <div className="container nav-container">
          <div className="logo gradient-text">EVENTO</div>

          <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
            <a href="#" className={currentPage === 'home' ? 'active' : ''} onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}>Events</a>
            <a href="#" className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false); }}>Dashboard</a>
            <a href="#" className={currentPage === 'admin' ? 'active' : ''} onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false); }}>Admin</a>
            <a href="#" className={currentPage === 'my-events' ? 'active' : ''} onClick={() => { setCurrentPage('my-events'); setIsMenuOpen(false); }}>My Tickets</a>
            <div className="nav-actions">
              <button className="btn btn-glass" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button className="btn btn-primary" onClick={handleAuth}>
                {user ? user.name.split(' ')[0] : 'Sign In'}
              </button>
            </div>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <main style={{ marginTop: '100px' }}>
        {currentPage === 'home' && (
          <div className="landing">
            <header className="hero">
              <div className="hero-bg"></div>
              <div className="container animate-up">
                <h1>
                  Experience Extraordinary <br />
                  <span className="gradient-text">Global Events</span>
                </h1>
                <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                  Discover, manage, and host world-class events on our unified management platform.
                  Built for creators and participants alike.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' })}>
                    Explore Events
                  </button>
                  <button className="btn btn-glass" onClick={() => setCurrentPage('admin')}>
                    Create Event
                  </button>
                </div>
              </div>
            </header>

            <section id="events-section" className="container animate-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Trending Events</h2>
                  <p>The highest rated events happening soon.</p>
                </div>
                <div className="glass" style={{ padding: '0.4rem', display: 'flex', gap: '0.25rem' }}>
                  {['All', 'Technology', 'Art'].map(cat => (
                    <button
                      key={cat}
                      className="btn"
                      style={{
                        background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                        color: categoryFilter === cat ? 'white' : 'var(--text-muted)',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem'
                      }}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'Technology' ? 'Tech' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="event-grid">
                {events
                  .filter(event => categoryFilter === 'All' || event.category === categoryFilter)
                  .map(event => (
                    <div key={event.id} className="card">
                      <div style={{ height: '220px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="glass" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: '600' }}>
                          {event.category}
                        </div>
                      </div>
                      <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{event.date}</p>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.4rem' }}>{event.title}</h3>
                        <p style={{ fontSize: '0.9rem' }}>{event.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'none' }}
                            className="hover-underline"
                          >
                            📍 {event.location}
                          </a>
                          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.5rem' }}>
                            {event.isPaid ? `₹${event.price}` : 'FREE'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`https://wa.me/?text=Check out this event: ${event.title} on ${event.date} at ${event.location}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-glass"
                            style={{ padding: '0.5rem', textDecoration: 'none' }}
                            title="Share on WhatsApp"
                          >
                            📱
                          </a>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                            onClick={() => handleRegister(event)}
                          >
                            {registrations.find(r => r.id === event.id) ? 'Registered' : 'Register'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="container animate-up" style={{ textAlign: 'center' }}>
              <div className="glass" style={{ padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Get in <span className="gradient-text">Touch</span></h2>
                <p style={{ marginBottom: '3rem' }}>Have questions? Reach out to our dedicated support team.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  <a href="mailto:support@evento.com" className="card" style={{ padding: '2rem', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
                    <h4>Email Support</h4>
                    <p style={{ fontSize: '0.9rem' }}>support@evento.com</p>
                  </a>
                  <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer" className="card" style={{ padding: '2rem', textDecoration: 'none' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
                    <h4>WhatsApp</h4>
                    <p style={{ fontSize: '0.9rem' }}>+1 555-EVENTO</p>
                  </a>
                  <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '300px' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509374!2d-122.4194155!3d37.7749295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1625123456789!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="container animate-up">
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '3rem' }}>Analytics Dashboard</h1>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎫</div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{events.length}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Total Events</p>
                </div>
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{registrations.length}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Total Registrations</p>
                </div>
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹{registrations.reduce((sum, reg) => sum + (reg.paymentDetails?.amount || 0), 0)}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Total Revenue</p>
                </div>
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🆓</div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{events.filter(e => !e.isPaid).length}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Free Events</p>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                All Events Overview
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{events.length} Active</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.map(event => {
                  const eventRegistrations = registrations.filter(r => r.id === event.id);
                  const eventRevenue = eventRegistrations.reduce((sum, reg) => sum + (reg.paymentDetails?.amount || 0), 0);
                  return (
                    <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{event.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{event.date} • {event.category}</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Price</p>
                          <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{event.isPaid ? `₹${event.price}` : 'FREE'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Registrations</p>
                          <p style={{ fontWeight: 'bold' }}>{eventRegistrations.length}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Revenue</p>
                          <p style={{ fontWeight: 'bold', color: '#10b981' }}>₹{eventRevenue}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="container animate-up">
            <div className="admin-grid">
              <div className="glass" style={{ padding: '2.5rem' }}>
                <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Create New Event</h2>
                <form onSubmit={handleCreateEvent}>
                  <div className="form-group">
                    <label className="form-label">Event Title</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. NextGen Web Hackathon"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                        style={{ appearance: 'none' }}
                      >
                        <option value="Technology">Technology</option>
                        <option value="Sustainability">Sustainability</option>
                        <option value="Art">Art</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        placeholder="e.g. June 12, 2026"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. San Francisco, CA"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="eventType"
                          checked={newEvent.isPaid}
                          onChange={() => setNewEvent({ ...newEvent, isPaid: true })}
                        />
                        <span>Paid Event</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="eventType"
                          checked={!newEvent.isPaid}
                          onChange={() => setNewEvent({ ...newEvent, isPaid: false })}
                        />
                        <span>Free Event</span>
                      </label>
                    </div>
                  </div>
                  {newEvent.isPaid && (
                    <div className="form-group">
                      <label className="form-label">Ticket Price (₹)</label>
                      <input
                        className="form-input"
                        type="number"
                        required
                        placeholder="e.g. 999"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      required
                      rows="4"
                      placeholder="Enter event details..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Event</button>
                </form>
              </div>

              <div>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Manage Events
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{events.length} Active</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {events.map(event => {
                    const eventRegistrations = registrations.filter(r => r.id === event.id);
                    const eventRevenue = eventRegistrations.reduce((sum, reg) => sum + (reg.paymentDetails?.amount || 0), 0);
                    return (
                      <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{event.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{event.date} • {event.category}</p>
                          </div>
                          <button
                            className="btn btn-glass"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--accent)', borderColor: 'rgba(244,63,94,0.2)' }}
                            onClick={() => deleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Price</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{event.isPaid ? `₹${event.price}` : 'FREE'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Registrations</p>
                            <p style={{ fontWeight: 'bold' }}>{eventRegistrations.length}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Revenue</p>
                            <p style={{ fontWeight: 'bold', color: '#10b981' }}>₹{eventRevenue}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'my-events' && (
          <div className="container animate-up">
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '3rem' }}>My Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '4rem', alignItems: 'start' }}>
              <div>
                {registrations.length === 0 ? (
                  <div className="glass" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>You haven't registered for any events yet.</p>
                    <button className="btn btn-primary" onClick={() => setCurrentPage('home')}>Browse Events</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                      <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎫</div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{registrations.length}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Total Tickets</p>
                      </div>
                      <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          ₹{registrations.reduce((sum, reg) => sum + (reg.paymentDetails?.amount || 0), 0)}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Total Spent</p>
                      </div>
                      <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🆓</div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {registrations.filter(r => !r.isPaid).length}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Free Events</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {registrations.map(event => (
                        <div key={event.id} className="card" style={{ flexDirection: 'row', gap: '2rem', padding: '2rem', flexWrap: 'wrap' }}>
                          <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{event.date} • {event.location}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                              {event.isPaid ? `Paid ₹${event.price}` : 'Free Event'} • {event.paymentDetails?.method || 'N/A'}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => joinTeam(event.id)}>
                                {teams[event.id] ? teams[event.id].teamName : 'Join Team'}
                              </button>
                              <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => generatePDF(event)}>📄 PDF</button>
                              <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => generateICCard(event)}>💳 IC Card</button>
                            </div>
                            
                            {/* Hidden IC Card for rendering */}
                            <div id={`ic-card-${event.id}`} style={{ position: 'absolute', left: '-9999px', width: '856px', height: '540px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px', boxSizing: 'border-box', color: 'white', fontFamily: 'Arial, sans-serif' }}>
                              <div style={{ display: 'flex', height: '100%', gap: '30px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>EVENTO</div>
                                    <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px' }}>{event.title}</div>
                                    <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px' }}>{event.date}</div>
                                    {userDetails[event.id] && (
                                      <div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{userDetails[event.id].name}</div>
                                        <div style={{ fontSize: '18px', opacity: 0.95, marginBottom: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '6px', display: 'inline-block' }}>{userDetails[event.id].role}</div>
                                        <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '5px' }}>{userDetails[event.id].email}</div>
                                        <div style={{ fontSize: '16px', opacity: 0.9 }}>{userDetails[event.id].phone}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>Registration ID</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{event.registrationId}</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                  {userDetails[event.id]?.photo && (
                                    <div style={{ width: '180px', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '4px solid white' }}>
                                      <img src={userDetails[event.id].photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                  )}
                                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                    <div style={{ width: '120px', height: '120px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>QR CODE</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', minWidth: '120px' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Status</p>
                            <p style={{ fontWeight: '800', color: '#10b981' }}>CONFIRMED</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>{event.registrationId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <aside>
                <h3 style={{ marginBottom: '1.5rem' }}>Updates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.map(note => (
                    <div key={note.id} className="glass" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <p style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>{note.text}</p>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{note.time}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-logo-section">
              <div className="logo gradient-text" style={{ marginBottom: '1.5rem' }}>EVENTO</div>
              <p style={{ maxWidth: '300px' }}>Elevating event management experiences for creators and participants worldwide.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Discover</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Hosting</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Docs</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>API</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Status</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Privacy</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Terms</a></li>
                <li><a href="#" className="btn-glass" style={{ border: 'none', padding: 0 }}>Cookies</a></li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.85rem' }}>
            © 2026 Evento Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Styles for mobile menu and other React-controlled elements */}
      <style>{`
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 1.5rem;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block;
          }

          .nav-links {
            display: flex;
            position: fixed;
            top: 80px;
            left: 100%;
            width: 100%;
            height: calc(100vh - 80px);
            background: var(--bg-color);
            flex-direction: column;
            padding: 3rem 1.5rem;
            transition: var(--transition-base);
            z-index: 999;
          }

          .nav-links.mobile-active {
            left: 0;
          }

          .nav-links a {
            font-size: 1.5rem;
            font-weight: 700;
          }

          .nav-actions {
            margin-top: 2rem;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .nav-actions .btn {
            width: 100%;
            padding: 1.2rem;
          }
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
      `}</style>

      <Chatbot />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowAuthModal(false);
            addNotification(`Welcome back, ${userData.name}!`);
          }}
        />
      )}

      {showDetailsModal && (
        <UserDetailsModal
          onClose={() => setShowDetailsModal(false)}
          onSave={saveUserDetails}
        />
      )}

      {showPaymentModal && currentEventForPayment && (
        <PaymentModal
          event={currentEventForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setCurrentEventForPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Floating WhatsApp Contact Button */}
      <a
        href="https://wa.me/15551234567"
        target="_blank"
        rel="noreferrer"
        className="glass floating-contact"
        title="Contact on WhatsApp"
      >
        📱
      </a>
    </div>
  );
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Evento Assistant. How can I help you today?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simple Mock AI Logic
    setTimeout(() => {
      let response = "I'm sorry, I don't understand that yet. But I can help with finding events or registration!";
      const q = input.toLowerCase();
      if (q.includes("event") || q.includes("tech") || q.includes("art")) response = "You can discover trending events on the homepage. We have Tech, Art, and Sustainability categories! Use the filter buttons to toggle.";
      if (q.includes("register")) response = "Just click the 'Register' button on any event card to join!";
      if (q.includes("team")) response = "Once registered, head to 'My Events' to find teammates and form teams.";
      if (q.includes("admin") || q.includes("host") || q.includes("create")) response = "Creators can manage events from the 'Host Dashboard'. Use the '+ Create Event' button to start!";
      if (q.includes("whatsapp") || q.includes("contact")) response = "You can contact us via the WhatsApp button at the bottom left, or check the 'Get in Touch' section!";

      setMessages(prev => [...prev, { text: response, sender: "ai" }]);
    }, 600);
  };

  return (
    <>
      <div className="chatbot-bubble" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </div>

      {isOpen && (
        <div className="chat-window glass">
          <div className="chat-header">
            <span style={{ fontWeight: '600' }}>AI Assistant</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Online</span>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message msg-${m.sender}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register' && !formData.name) {
      alert("Please enter your name.");
      return;
    }
    // Simulate auth success
    onSuccess({ name: formData.name || formData.email.split('@')[0] });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Sign in to manage your events' : 'Join Evento and start exploring'}</p>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <div
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </div>
            <div
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            {mode === 'login' ? (
              <p>Don't have an account? <span onClick={() => setMode('register')}>Register</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => setMode('login')}>Sign In</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDetailsModal({ onClose, onSave }) {
  const [details, setDetails] = useState({ name: '', email: '', phone: '', photo: '', role: 'Attendee' });
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(details);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="auth-header">
          <h2>ID Card Details</h2>
          <p>Enter your details for the ID card</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={details.name}
                onChange={e => setDetails({ ...details, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={details.email}
                onChange={e => setDetails({ ...details, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 234 567 8900"
                value={details.phone}
                onChange={e => setDetails({ ...details, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={details.role}
                onChange={e => setDetails({ ...details, role: e.target.value })}
              >
                <option value="Attendee">Attendee</option>
                <option value="Speaker">Speaker</option>
                <option value="Organizer">Organizer</option>
                <option value="Volunteer">Volunteer</option>
                <option value="VIP">VIP</option>
                <option value="Press">Press</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={() => fileInputRef.current.click()}
                >
                  📷 Upload Photo
                </button>
                {details.photo && (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={details.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Generate ID Card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ event, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const ticketPrice = event.price;

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      setShowConfirmation(true);
      
      setTimeout(() => {
        const paymentDetails = {
          method: paymentMethod,
          amount: ticketPrice,
          transactionId: `TXN${Date.now()}`,
          paidAt: new Date().toLocaleString()
        };
        onSuccess(paymentDetails);
      }, 2000);
    }, 1500);
  };

  if (showConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Payment Successful!</h2>
          <p style={{ marginBottom: '1.5rem' }}>Your ticket has been confirmed</p>
          <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Transaction ID</p>
            <p style={{ fontWeight: 'bold' }}>TXN{Date.now()}</p>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="auth-header">
          <h2>Complete Payment</h2>
          <p>{event.title}</p>
        </div>
        
        <div className="glass" style={{ padding: '1.5rem', margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Ticket Price</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{ticketPrice}</p>
          </div>
          <div style={{ fontSize: '3rem' }}>🎫</div>
        </div>

        <div className="auth-body">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              className="btn"
              style={{
                flex: 1,
                background: paymentMethod === 'card' ? 'var(--primary)' : 'transparent',
                border: '1px solid var(--glass-border)'
              }}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Card
            </button>
            <button
              className="btn"
              style={{
                flex: 1,
                background: paymentMethod === 'upi' ? 'var(--primary)' : 'transparent',
                border: '1px solid var(--glass-border)'
              }}
              onClick={() => setPaymentMethod('upi')}
            >
              📱 UPI
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {paymentMethod === 'card' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    maxLength="19"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay ₹${ticketPrice}`}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem' }}>
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
