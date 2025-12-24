import { useState } from 'react';
import './Admin.css';
import AccountManagement from './AccountManagement';
import SystemStats from './SystemStats';
import ContentControl from './ContentControl';
import SecurityPanel from './SecurityPanel';
import MediaApproval from './MediaApproval';
import Header from './Header';

function Admin() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user.role !== 'ADMIN' && user.role !== 'admin') {
    return <div className="container"><h2>Access Denied</h2></div>;
  }

  const [activeTab, setActiveTab] = useState('account');

  const renderTab = () => {
    switch (activeTab) {
      case 'account':
        return <AccountManagement />;
      case 'stats':
        return <SystemStats />;
      case 'content':
        return <ContentControl />;
      case 'security':
        return <SecurityPanel />;
      case 'media':
        return <MediaApproval />;
      default:
        return <AccountManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Header user={user} />
      <div className="admin-tabs">
        <button
          className={activeTab === 'account' ? 'active' : ''}
          onClick={() => setActiveTab('account')}
        >
          Account Management
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          System Monitoring & Stats
        </button>
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          Content & Ticket Control
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          Security & Reliability
        </button>
        <button
          className={activeTab === 'media' ? 'active' : ''}
          onClick={() => setActiveTab('media')}
        >
          Media Approval
        </button>
      </div>
      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default Admin;