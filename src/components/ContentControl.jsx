import { useState, useEffect } from 'react';
import './ContentControl.css';

function ContentControl() {
  const [tickets, setTickets] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticket_type: '',
    title: '',
    event_date: '',
    location: '',
    price: '',
    total_quantity: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTickets();
    fetchMedia();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
    }
  };

  const fetchMedia = async () => {
    // Fetch pending media for approval
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMedia(data.media || []);
      } else {
        setError(data.error || 'Failed to fetch pending media');
      }
    } catch (err) {
      setError('Failed to fetch pending media');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });
      const data = await res.json();
      if (res.ok) {
        fetchTickets();
        setShowAddTicket(false);
        setNewTicket({
          ticket_type: '',
          title: '',
          event_date: '',
          location: '',
          price: '',
          total_quantity: '',
        });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to add ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchTickets();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete ticket');
    }
  };

  const handleApproveRejectMedia = async (mediaId, isApproved, rejectionReason = '') => {
    try {
      const endpoint = isApproved 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/approve`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/reject`;
      
      const method = 'POST';
      const body = isApproved ? {} : { reason: rejectionReason };
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        fetchMedia();
        // Show success message
        alert(data.message || `Media ${isApproved ? 'approved' : 'rejected'} successfully`);
      } else {
        alert(data.error || `Failed to ${isApproved ? 'approve' : 'reject'} media`);
      }
    } catch (err) {
      alert('Failed to update media');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="content-control">
      <h3>Content & Ticket Control</h3>

      <div className="section">
        <h4>Manage Tickets</h4>
        <button onClick={() => setShowAddTicket(!showAddTicket)}>
          {showAddTicket ? 'Cancel' : 'Add New Ticket'}
        </button>

        {showAddTicket && (
          <form onSubmit={handleAddTicket} className="add-ticket-form">
            <select
              value={newTicket.ticket_type}
              onChange={(e) => setNewTicket({ ...newTicket, ticket_type: e.target.value })}
              required
            >
              <option value="">Select Type</option>
              <option value="EVENT">Event</option>
              <option value="GAME">Game</option>
              <option value="TRANSPORT">Transport</option>
            </select>
            <input
              type="text"
              placeholder="Title"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              value={newTicket.event_date}
              onChange={(e) => setNewTicket({ ...newTicket, event_date: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newTicket.location}
              onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={newTicket.price}
              onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Total Quantity"
              value={newTicket.total_quantity}
              onChange={(e) => setNewTicket({ ...newTicket, total_quantity: e.target.value })}
              required
            />
            <button type="submit">Add Ticket</button>
          </form>
        )}

        <table className="tickets-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id}>
                <td>{ticket.ticket_type}</td>
                <td>{ticket.title}</td>
                <td>{new Date(ticket.event_date).toLocaleString()}</td>
                <td>{ticket.location}</td>
                <td>R{ticket.price}</td>
                <td>{ticket.available_quantity}/{ticket.total_quantity}</td>
                <td>
                  <button onClick={() => handleDeleteTicket(ticket.ticket_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h4>Approve/Reject Media Uploads</h4>
        <table className="media-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Uploader</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {media.map((item) => (
              <tr key={item.media_id}>
                <td>{item.title}</td>
                <td>{item.media_type}</td>
                <td>{item.uploader_email}</td>
                <td>{new Date(item.uploaded_at).toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => handleApproveRejectMedia(item.media_id, true)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection (optional):');
                      handleApproveRejectMedia(item.media_id, false, reason);
                    }}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContentControl;