import React, { useState, useEffect } from 'react';
import './SendAirtime.css';

function SendAirtime({ balance, phone, setPhone, airtimeAmount, setAirtimeAmount, pin, setPin, handleSendAirtime }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('sendAirtimeProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your airtime transfer...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your airtime transfer...');
    localStorage.setItem('sendAirtimeProcessing', 'true');

    try {
      await handleSendAirtime(e);
      setStatusMessage('Airtime sent successfully!');
      localStorage.removeItem('sendAirtimeProcessing');
    } catch (error) {
      setStatusMessage('Transfer failed. Please try again.');
      localStorage.removeItem('sendAirtimeProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <p>Available Airtime: {balance.toFixed(2)}</p>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Recipient Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isProcessing} />
        <input type="number" placeholder="Amount" value={airtimeAmount} onChange={(e) => setAirtimeAmount(e.target.value)} required disabled={isProcessing} />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
        <button type="submit" disabled={isProcessing} aria-describedby="status-message">
          {isProcessing ? 'Processing...' : 'Send Airtime'}
        </button>
        {isProcessing && <div className="spinner" aria-hidden="true"></div>}
        <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
      </form>
    </div>
  );
}

export default SendAirtime;