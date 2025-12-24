import React, { useState, useEffect } from 'react';
import './BuyAirtime.css';

function BuyAirtime({ networks, denominations, selectedNetwork, setSelectedNetwork, airtimeAmount, setAirtimeAmount, phone, setPhone, pin, setPin, handleBuyAirtime }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('airtimeProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your airtime purchase...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your airtime purchase...');
    localStorage.setItem('airtimeProcessing', 'true');

    try {
      await handleBuyAirtime(e);
      setStatusMessage('Purchase completed successfully!');
      localStorage.removeItem('airtimeProcessing');
    } catch (error) {
      setStatusMessage('Purchase failed. Please try again.');
      localStorage.removeItem('airtimeProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} required disabled={isProcessing}>
        <option key="select-network" value="">Select Network</option>
        {networks.map(n => <option key={n.network_id} value={n.name}>{n.name}</option>)}
      </select>
      <select value={airtimeAmount} onChange={(e) => setAirtimeAmount(e.target.value)} required disabled={isProcessing}>
        <option key="select-amount" value="">Select Amount</option>
        {denominations.map(d => <option key={d} value={d}>R{d}</option>)}
      </select>
      <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isProcessing} />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
      <button type="submit" disabled={isProcessing} aria-describedby="status-message">
        {isProcessing ? 'Processing...' : 'Buy Airtime'}
      </button>
      {isProcessing && <div className="spinner" aria-hidden="true"></div>}
      <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
    </form>
  );
}

export default BuyAirtime;