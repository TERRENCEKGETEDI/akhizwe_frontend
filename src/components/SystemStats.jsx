import { useState, useEffect } from 'react';
import './SystemStats.css';

function SystemStats() {
  const [stats, setStats] = useState({
    airtimeData: [],
    tickets: [],
    media: [],
    revenue: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (dateRange.start) query.append('start_date', dateRange.start);
      if (dateRange.end) query.append('end_date', dateRange.end);

      const endpoints = [
        'airtime-data',
        'tickets',
        'media',
        'revenue',
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats/${endpoint}?${query}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.json();
        })
      );

      setStats({
        airtimeData: results[0].stats || [],
        tickets: results[1].stats || [],
        media: results[2].stats || [],
        revenue: results[3].revenue || [],
      });
    } catch (err) {
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="system-stats">
      <h3>System Monitoring & Stats</h3>

      <div className="date-filters">
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </label>
        <button onClick={fetchStats}>Apply Filters</button>
      </div>

      <div className="stats-section">
        <h4>Airtime/Data Sales Statistics</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Network</th>
              <th>Bundle Type</th>
              <th>Transactions</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats.airtimeData.map((stat, index) => (
              <tr key={index}>
                <td>{stat.network}</td>
                <td>{stat.bundle_type}</td>
                <td>{stat.transaction_count}</td>
                <td>R{stat.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-section">
        <h4>Ticket Sales Statistics</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Tickets Sold</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.tickets.map((stat, index) => (
              <tr key={index}>
                <td>{stat.ticket_type}</td>
                <td>{stat.title}</td>
                <td>{stat.tickets_sold}</td>
                <td>R{stat.total_revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-section">
        <h4>Media Upload/Delete/Flag Statistics</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Approved</th>
              <th>Count</th>
              <th>Interactions</th>
            </tr>
          </thead>
          <tbody>
            {stats.media.map((stat, index) => (
              <tr key={index}>
                <td>{stat.media_type}</td>
                <td>{stat.is_approved ? 'Yes' : 'No'}</td>
                <td>{stat.count}</td>
                <td>{stat.interactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-section">
        <h4>Revenue and Usage Reports</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Transaction Type</th>
              <th>Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats.revenue.map((stat, index) => (
              <tr key={index}>
                <td>{stat.transaction_type}</td>
                <td>{stat.transaction_count}</td>
                <td>R{stat.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SystemStats;