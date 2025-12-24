import React, { useState, useEffect } from 'react';
import './SendData.css';

function SendData({ phone, setPhone, pin, setPin, handleSendData, dataBalance, dataAmount, setDataAmount }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('sendDataProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your data transfer...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your data transfer...');
    localStorage.setItem('sendDataProcessing', 'true');

    try {
      await handleSendData(e);
      setStatusMessage('Data sent successfully!');
      localStorage.removeItem('sendDataProcessing');
    } catch (error) {
      setStatusMessage('Transfer failed. Please try again.');
      localStorage.removeItem('sendDataProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <p>Available Data: {((dataBalance || 0) > 1024 ? ((dataBalance || 0) / 1024).toFixed(2) + ' GB' : (dataBalance || 0).toFixed(2) + ' MB')}</p>
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="Data Amount (MB)" value={dataAmount} onChange={(e) => setDataAmount(e.target.value)} required min="0" step="0.01" disabled={isProcessing} />
        <input type="text" placeholder="Recipient Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isProcessing} />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
        <button type="submit" disabled={isProcessing} aria-describedby="status-message">
          {isProcessing ? 'Processing...' : 'Send Data'}
        </button>
        {isProcessing && <div className="spinner" aria-hidden="true"></div>}
        <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
      </form>
    </div>
  );
}

export default SendData;