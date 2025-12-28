import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './Tickets.css';
import TopUpWallet from './TopUpWallet';
import { formatDataBalance } from '../utils/format';

// Simple JWT decode function
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    priceMin: '',
    priceMax: '',
    search: ''
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    seat: '',
    pin: ''
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [balance, setBalance] = useState(0);
  const [airtimeBalance, setAirtimeBalance] = useState(0);
  const [dataBalance, setDataBalance] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [topUpPin, setTopUpPin] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');

  useEffect(() => {
    loadTickets();
    loadUserTickets();
    loadUpcomingEvents();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  useEffect(() => {
    // Decode user info from token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setBalance(parseFloat(decoded.wallet_balance || 0));
        setAirtimeBalance(parseFloat(decoded.airtime_balance || 0));
        setDataBalance(parseFloat(decoded.data_balance || 0));
      }
    }
  }, []);

  const loadTickets = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.priceMin) queryParams.append('price_min', filters.priceMin);
      if (filters.priceMax) queryParams.append('price_max', filters.priceMax);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('upcoming_only', 'true');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserTickets(data.purchases);
      }
    } catch (error) {
      console.error('Error loading user tickets:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    }
  };


  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePurchase = async () => {
    if (!selectedTicket) return;

    setPurchaseStatus({ status: 'processing', message: 'Processing purchase...' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.ticket_id,
          quantity: purchaseData.quantity,
          seat: purchaseData.seat,
          pin: purchaseData.pin
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPurchaseStatus({
          status: 'success',
          message: 'Purchase successful!',
          data
        });
        loadTickets();
        loadUserTickets();
        loadUpcomingEvents();
        setTimeout(() => {
          setShowPurchaseModal(false);
          setPurchaseStatus(null);
          setSelectedTicket(null);
        }, 2000);
      } else {
        setPurchaseStatus({
          status: 'error',
          message: data.error || 'Purchase failed'
        });
      }
    } catch (error) {
      setPurchaseStatus({
        status: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  const handleCancelTicket = async (transactionRef) => {
    if (!confirm('Are you sure you want to cancel this ticket? Refund policy applies.')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/cancel/${transactionRef}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Ticket cancelled successfully. Refund: R${data.refund_amount}`);
        loadUserTickets();
        loadUpcomingEvents();
      } else {
        const error = await response.json();
        alert(`Cancellation failed: ${error.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/airtime-data/top-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: topUpAmount, payment_method: paymentMethod, pin: topUpPin })
      });
      const data = await response.json();
      if (data.message && data.added_amount) {
        setBalance(balance + parseFloat(data.added_amount));
        setTopUpMessage('Wallet topped up successfully!');
        setTopUpAmount('');
        setTopUpPin('');
      } else {
        setTopUpMessage(data.error || 'Error topping up wallet');
      }
    } catch (error) {
      setTopUpMessage('Error topping up wallet');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'ACTIVE': 'badge-success',
      'USED': 'badge-info',
      'CANCELLED': 'badge-danger',
      'UPCOMING': 'badge-warning',
      'ONGOING': 'badge-primary',
      'EXPIRED': 'badge-secondary'
    };

    return <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>{status}</span>;
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading tickets...</div></div>;
  }

  return (
    <div className="container">
      <h2>Tickets Dashboard</h2>
      <div className="balance-display">
        <div className="balance-item">
          <strong>Wallet Balance: R{balance.toFixed(2)}</strong>
        </div>
        <div className="balance-item">
          <strong>Airtime Balance: R{airtimeBalance.toFixed(2)}</strong>
        </div>
        <div className="balance-item">
          <strong>Data Balance: {formatDataBalance(dataBalance)}</strong>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'browse' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('browse')}
        >
          Browse Tickets
        </button>
        <button
          className={activeTab === 'my-tickets' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('my-tickets')}
        >
          My Tickets
        </button>
        <button
          className={activeTab === 'upcoming' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={activeTab === 'top-up' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('top-up')}
        >
          Top Up Wallet
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="ticket-section">
          {/* Filters */}
          <div className="filters">
            <div className="filter-row">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="EVENT">Events</option>
                <option value="GAME">Games</option>
                <option value="TRANSPORT">Transport</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />

              <input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              />

              <input
                type="text"
                placeholder="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.ticket_id} className="ticket-card">
                <div className="ticket-header">
                  <h3>{ticket.title}</h3>
                  {ticket.is_featured && <span className="featured-badge">Featured</span>}
                </div>

                <div className="ticket-details">
                  <p><strong>Type:</strong> {ticket.ticket_type} {ticket.ticket_subtype && `(${ticket.ticket_subtype})`}</p>
                  <p><strong>Date:</strong> {formatDate(ticket.event_date)}</p>
                  {ticket.start_time && <p><strong>Start Time:</strong> {ticket.start_time}</p>}
                  {ticket.end_time && <p><strong>End Time:</strong> {ticket.end_time}</p>}
                  <p><strong>Location:</strong> {ticket.location}</p>
                  <p><strong>Price:</strong> R{ticket.price}</p>
                  {ticket.performers && ticket.performers.length > 0 && (
                    <p><strong>Performers:</strong> {ticket.performers.join(', ')}</p>
                  )}
                  {ticket.teams && ticket.teams.length > 0 && (
                    <p><strong>Teams:</strong> {ticket.teams.join(' vs ')}</p>
                  )}
                  {ticket.description && <p>{ticket.description}</p>}
                  <p><strong>Available:</strong> {ticket.available_quantity}/{ticket.total_quantity}</p>
                  {getStatusBadge(ticket.status_display || 'UPCOMING')}
                </div>

                <div className="ticket-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowPurchaseModal(true);
                    }}
                    disabled={ticket.available_quantity === 0}
                  >
                    {ticket.available_quantity === 0 ? 'Sold Out' : 'Buy Ticket'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-tickets' && (
        <div className="ticket-section">
          <h3>My Ticket History</h3>
          <div className="tickets-list">
            {userTickets.map(ticket => (
              <div key={ticket.transaction_ref} className="ticket-item">
                <div className="ticket-info">
                  <h4>{ticket.title}</h4>
                  <p><strong>Date:</strong> {formatDate(ticket.event_date)}</p>
                  <p><strong>Location:</strong> {ticket.location}</p>
                  <p><strong>Amount:</strong> R{ticket.amount}</p>
                  <p><strong>Purchase Date:</strong> {formatDate(ticket.purchase_date)}</p>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="ticket-actions">
                  {ticket.status === 'ACTIVE' && (
                    <button
                      className="btn-danger"
                      onClick={() => handleCancelTicket(ticket.transaction_ref)}
                    >
                      Cancel & Refund
                    </button>
                  )}

                  {ticket.qr_code && ticket.status === 'ACTIVE' && (
                    <div className="qr-code">
                      <p><strong>QR Code:</strong></p>
                      {ticket.qr_code.startsWith('data:image') ? (
                        <img src={ticket.qr_code} alt="QR Code" className="qr-image" />
                      ) : (
                        <div className="qr-display">{ticket.qr_code}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="ticket-section">
          <h3>My Upcoming Events</h3>
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.ticket_id} className="event-item">
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Seat:</strong> {event.seat || 'Not assigned'}</p>
                </div>

                <div className="event-qr">
                  <p><strong>Your QR Code:</strong></p>
                  {event.qr_code.startsWith('data:image') ? (
                    <img src={event.qr_code} alt="QR Code" className="qr-image" />
                  ) : (
                    <div className="qr-display">{event.qr_code}</div>
                  )}
                  <small>Show this at the venue</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'top-up' && (
        <div className="ticket-section">
          <h3>Top Up Wallet</h3>
          {topUpMessage && <p style={{ color: topUpMessage.includes('successfully') ? 'green' : 'red' }}>{topUpMessage}</p>}
          <TopUpWallet
            topUpAmount={topUpAmount}
            setTopUpAmount={setTopUpAmount}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            pin={topUpPin}
            setPin={setTopUpPin}
            handleTopUp={handleTopUp}
          />
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Purchase Ticket</h3>

            <div className="ticket-summary">
              <h4>{selectedTicket.title}</h4>
              <p><strong>Price:</strong> R{selectedTicket.price}</p>
              <p><strong>Date:</strong> {formatDate(selectedTicket.event_date)}</p>
              {selectedTicket.start_time && <p><strong>Start Time:</strong> {selectedTicket.start_time}</p>}
              {selectedTicket.end_time && <p><strong>End Time:</strong> {selectedTicket.end_time}</p>}
              <p><strong>Location:</strong> {selectedTicket.location}</p>
              {selectedTicket.performers && selectedTicket.performers.length > 0 && (
                <p><strong>Performers:</strong> {selectedTicket.performers.join(', ')}</p>
              )}
              {selectedTicket.teams && selectedTicket.teams.length > 0 && (
                <p><strong>Teams:</strong> {selectedTicket.teams.join(' vs ')}</p>
              )}
              {selectedTicket.description && <p>{selectedTicket.description}</p>}
            </div>

            <div className="purchase-form">
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTicket.max_per_user || 10}
                  value={purchaseData.quantity}
                  onChange={(e) => setPurchaseData(prev => ({
                    ...prev,
                    quantity: parseInt(e.target.value)
                  }))}
                />
              </div>

              {(selectedTicket.ticket_type === 'EVENT' || selectedTicket.ticket_type === 'GAME') &&
               selectedTicket.ticket_subtype === 'RESERVED_SEATING' && (
                <div className="form-group">
                  <label>Seat (optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. A1, B12"
                    value={purchaseData.seat}
                    onChange={(e) => setPurchaseData(prev => ({
                      ...prev,
                      seat: e.target.value
                    }))}
                  />
                </div>
              )}

              <div className="form-group">
                <label>PIN (for security):</label>
                <input
                  type="password"
                  value={purchaseData.pin}
                  onChange={(e) => setPurchaseData(prev => ({
                    ...prev,
                    pin: e.target.value
                  }))}
                />
              </div>

              <div className="purchase-total">
                <strong>Total: R{(selectedTicket.price * purchaseData.quantity).toFixed(2)}</strong>
              </div>

              {purchaseStatus && (
                <div className={`status-message ${purchaseStatus.status}`}>
                  {purchaseStatus.message}
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setPurchaseStatus(null);
                    setSelectedTicket(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handlePurchase}
                  disabled={purchaseStatus?.status === 'processing'}
                >
                  {purchaseStatus?.status === 'processing' ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;