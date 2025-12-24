import React, { useState, useEffect } from 'react';
import './TopUpWallet.css';

function TopUpWallet({ topUpAmount, setTopUpAmount, paymentMethod, setPaymentMethod, pin, setPin, handleTopUp }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('topUpProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your top-up...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your top-up...');
    localStorage.setItem('topUpProcessing', 'true');

    try {
      await handleTopUp(e);
      setStatusMessage('Top-up completed successfully!');
      localStorage.removeItem('topUpProcessing');
    } catch (error) {
      setStatusMessage('Top-up failed. Please try again.');
      localStorage.removeItem('topUpProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" placeholder="Amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} required disabled={isProcessing} />
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isProcessing}>
        <option key="card" value="card">Card</option>
        <option key="bank" value="bank">Bank Transfer</option>
      </select>
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
      <button type="submit" disabled={isProcessing} aria-describedby="status-message">
        {isProcessing ? 'Processing...' : 'Top Up'}
      </button>
      {isProcessing && <div className="spinner" aria-hidden="true"></div>}
      <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
    </form>
  );
}

export default TopUpWallet;