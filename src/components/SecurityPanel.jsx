import { useState, useEffect } from 'react';
import './SecurityPanel.css';

function SecurityPanel() {
  const [logs, setLogs] = useState([]);
  const [failedTransactions, setFailedTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [services, setServices] = useState([
    { name: 'Payment Gateway', enabled: true },
    { name: 'Media Upload', enabled: true },
    { name: 'Ticket Sales', enabled: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logFilters, setLogFilters] = useState({ admin_email: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
    fetchFailedTransactions();
    fetchFraudAlerts();
  }, [logFilters]);

  const fetchLogs = async () => {
    try {
      const query = new URLSearchParams(logFilters);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/logs?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch logs');
    }
  };

  const fetchFailedTransactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/transactions/failed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFailedTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch failed transactions');
    }
  };

  const fetchFraudAlerts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/fraud-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFraudAlerts(data.alerts || []);
      }
    } catch (err) {
      // Placeholder
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (serviceName, enabled) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/services/${serviceName}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (res.ok) {
        setServices(services.map(s => s.name === serviceName ? { ...s, enabled } : s));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to toggle service');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/backup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Failed to initiate backup');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="security-panel">
      <h3>Security & Reliability</h3>

      <div className="section">
        <h4>Audit Logs</h4>
        <div className="filters">
          <input
            type="text"
            placeholder="Filter by Admin Email"
            value={logFilters.admin_email}
            onChange={(e) => setLogFilters({ ...logFilters, admin_email: e.target.value })}
          />
        </div>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Admin Email</th>
              <th>Action</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td>{log.admin_email}</td>
                <td>{log.action}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h4>Failed Transaction Logs</h4>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction Ref</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {failedTransactions.map((tx) => (
              <tr key={tx.transaction_ref}>
                <td>{tx.transaction_ref}</td>
                <td>{tx.transaction_type}</td>
                <td>R{tx.amount}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h4>Fraud & Suspicious Activity Alerts</h4>
        <div className="alerts-list">
          {fraudAlerts.length === 0 ? (
            <p>No alerts at this time.</p>
          ) : (
            fraudAlerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <p>{alert.message}</p>
                <small>{new Date(alert.timestamp).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section">
        <h4>System Services Control</h4>
        <div className="services-list">
          {services.map((service) => (
            <div key={service.name} className="service-item">
              <span>{service.name}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={service.enabled}
                  onChange={(e) => handleToggleService(service.name, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h4>Backup & Recovery</h4>
        <button onClick={handleBackup} className="backup-btn">Initiate Backup</button>
      </div>
    </div>
  );
}

export default SecurityPanel;