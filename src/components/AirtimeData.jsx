import { useState, useEffect } from 'react';
import './Dashboard.css';
import Header from './Header';
import BuyAirtime from './BuyAirtime';
import BuyData from './BuyData';
import SendAirtime from './SendAirtime';
import SendData from './SendData';
import RequestAdvance from './RequestAdvance';
import TopUpWallet from './TopUpWallet';
import TransactionHistory from './TransactionHistory';
import PackagesTable from './PackagesTable';

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

function AirtimeData() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [networks, setNetworks] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [denominations] = useState([10, 20, 50, 100, 200, 500]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [dataBundle, setDataBundle] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('buy-airtime');
  const [balance, setBalance] = useState(0);
  const [airtimeBalance, setAirtimeBalance] = useState(0);
  const [dataBalance, setDataBalance] = useState(0);
  const [userPhone, setUserPhone] = useState('');
  const [dataQuantity, setDataQuantity] = useState(1);
  const [dataAmount, setDataAmount] = useState('');
  const [buyDataLoading, setBuyDataLoading] = useState(false);
  const [sendDataLoading, setSendDataLoading] = useState(false);

  useEffect(() => {
    fetchNetworks();
    // Decode user info from token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setBalance(parseFloat(decoded.wallet_balance || 0));
        setAirtimeBalance(parseFloat(decoded.airtime_balance || 0));
        setDataBalance(parseFloat(decoded.data_balance || 0));
        setUserPhone(decoded.phone || '');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'buy-airtime' || activeTab === 'buy-data') {
      setPhone(userPhone);
    } else if (activeTab === 'send-airtime' || activeTab === 'send-data') {
      setPhone('');
    }
  }, [activeTab, userPhone]);

  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/networks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNetworks(data.networks);
    } catch (error) {
      console.error('Fetch networks error:', error);
    }
  };

  const fetchBundles = async (network) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/bundles/${network}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setBundles(data.bundles);
    } catch (error) {
      console.error('Fetch bundles error:', error);
    }
  };

  const handleBuyAirtime = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/buy-airtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ network: selectedNetwork, amount: airtimeAmount, phone, pin })
      });
      const data = await response.json();
      if (data.message) {
        setBalance(balance - parseFloat(airtimeAmount));
        if (phone === userPhone) {
          setAirtimeBalance(airtimeBalance + parseFloat(airtimeAmount));
        }
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error buying airtime');
    }
  };

  const handleBuyData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/buy-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bundle_id: dataBundle, phone, pin })
      });
      const data = await response.json();
      if (data.message) {
        const selectedBundle = bundles.find(b => b.bundle_id == dataBundle);
        if (selectedBundle) {
          setBalance(balance - parseFloat(selectedBundle.price));
          if (phone === userPhone) {
            const dataMB = selectedBundle.data_size === '1GB' ? 1024 : selectedBundle.data_size === '5GB' ? 5120 : 0; // Simple conversion
            setDataBalance(dataBalance + dataMB);
          }
        }
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error buying data');
    }
  };

  const handleSendAirtime = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/send-airtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipient_phone: phone, amount: airtimeAmount, pin })
      });
      const data = await response.json();
      if (data.message) {
        setAirtimeBalance(airtimeBalance - parseFloat(airtimeAmount));
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error sending airtime');
    }
  };

  const handleSendData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/send-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipient_phone: phone, data_amount: dataAmount, pin })
      });
      const data = await response.json();
      if (data.message) {
        setDataBalance(dataBalance - parseFloat(dataAmount));
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error sending data');
    }
  };

  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/request-advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: advanceAmount, pin })
      });
      const data = await response.json();
      if (data.message) {
        setBalance(balance + parseFloat(advanceAmount));
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error requesting advance');
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/top-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: topUpAmount, payment_method: paymentMethod, pin })
      });
      const data = await response.json();
      if (data.message && data.added_amount) {
        setBalance(balance + parseFloat(data.added_amount));
      }
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Error topping up wallet');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTransactions();
    }
  }, [activeTab]);
  

  return (
    <div>
      <Header user={user} />
      <div className="container">
        <h2>Airtime & Data Dashboard</h2>
        <div className="balance-display">
          <div className="balance-item">
            <strong>Wallet Balance: R{balance.toFixed(2)}</strong>
          </div>
          <div className="balance-item">
            <strong>Airtime Balance: R{airtimeBalance.toFixed(2)}</strong>
          </div>
          <div className="balance-item">
            <strong>Data Balance: {dataBalance.toFixed(0)} MB</strong>
          </div>
        </div>
        {message && <p>{message}</p>}
      <div className="tabs">
        <button key="packages" className={activeTab === 'packages' ? 'active' : ''} onClick={() => setActiveTab('packages')}>Packages</button>
        <button key="buy-airtime" className={activeTab === 'buy-airtime' ? 'active' : ''} onClick={() => setActiveTab('buy-airtime')}>Airtime</button>
        <button key="buy-data" className={activeTab === 'buy-data' ? 'active' : ''} onClick={() => setActiveTab('buy-data')}>Data</button>
        <button key="send-airtime" className={activeTab === 'send-airtime' ? 'active' : ''} onClick={() => setActiveTab('send-airtime')}>Send Airtime</button>
        <button key="send-data" className={activeTab === 'send-data' ? 'active' : ''} onClick={() => setActiveTab('send-data')}>Send Data</button>
        <button key="advance" className={activeTab === 'advance' ? 'active' : ''} onClick={() => setActiveTab('advance')}>Advance</button>
        <button key="top-up" className={activeTab === 'top-up' ? 'active' : ''} onClick={() => setActiveTab('top-up')}>Top Up</button>
        <button key="history" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
      </div>
      {activeTab === 'packages' && <PackagesTable />}
      {activeTab === 'buy-airtime' && <BuyAirtime networks={networks} denominations={denominations} selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} airtimeAmount={airtimeAmount} setAirtimeAmount={setAirtimeAmount} phone={phone} setPhone={setPhone} pin={pin} setPin={setPin} handleBuyAirtime={handleBuyAirtime} />}
      {activeTab === 'buy-data' && <BuyData networks={networks} bundles={bundles} selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} dataBundle={dataBundle} setDataBundle={setDataBundle} phone={phone} setPhone={setPhone} pin={pin} setPin={setPin} handleBuyData={handleBuyData} fetchBundles={fetchBundles} dataQuantity={dataQuantity} setDataQuantity={setDataQuantity} loading={buyDataLoading} />}
      {activeTab === 'send-airtime' && <SendAirtime balance={airtimeBalance} phone={phone} setPhone={setPhone} airtimeAmount={airtimeAmount} setAirtimeAmount={setAirtimeAmount} pin={pin} setPin={setPin} handleSendAirtime={handleSendAirtime} />}
      {activeTab === 'send-data' && <SendData phone={phone} setPhone={setPhone} pin={pin} setPin={setPin} handleSendData={handleSendData} dataBalance={dataBalance} dataAmount={dataAmount} setDataAmount={setDataAmount} />}
      {activeTab === 'advance' && <RequestAdvance advanceAmount={advanceAmount} setAdvanceAmount={setAdvanceAmount} pin={pin} setPin={setPin} handleRequestAdvance={handleRequestAdvance} />}
      {activeTab === 'top-up' && <TopUpWallet topUpAmount={topUpAmount} setTopUpAmount={setTopUpAmount} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} pin={pin} setPin={setPin} handleTopUp={handleTopUp} />}
      {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
      </div>
    </div>
  );
}

export default AirtimeData;