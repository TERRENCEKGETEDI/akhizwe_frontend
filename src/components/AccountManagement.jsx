import { useState, useEffect } from 'react';
import './AccountManagement.css';

function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', blocked: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({ ...filters, page: pagination.page, limit: pagination.limit });
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports');
    }
  };

  const handleBlockUnblock = async (email, isBlocked) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${email}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_blocked: isBlocked }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleDelete = async (email) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${email}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchReports();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to update report');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="account-management">
      <h3>Account Management</h3>

      <div className="filters">
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={filters.blocked} onChange={(e) => setFilters({ ...filters, blocked: e.target.value })}>
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td>{user.email}</td>
              <td>{user.full_name}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td>R{user.wallet_balance}</td>
              <td>{user.is_blocked ? 'Blocked' : 'Active'}</td>
              <td>
                <button onClick={() => handleBlockUnblock(user.email, !user.is_blocked)}>
                  {user.is_blocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => handleDelete(user.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={pagination.page <= 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.pages}</span>
        <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>
          Next
        </button>
      </div>

      <h4>Reported Users/Content</h4>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Reporter</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.report_id}>
              <td>{report.report_type}</td>
              <td>{report.reporter_email}</td>
              <td>{report.reason}</td>
              <td>{report.status}</td>
              <td>
                {report.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleReportStatus(report.report_id, 'REVIEWED')}>Review</button>
                    <button onClick={() => handleReportStatus(report.report_id, 'RESOLVED')}>Resolve</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountManagement;