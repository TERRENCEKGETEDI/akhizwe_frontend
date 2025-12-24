import React, { useState, useEffect } from 'react';
import './RequestAdvance.css';

function RequestAdvance({ advanceAmount, setAdvanceAmount, pin, setPin, handleRequestAdvance }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('advanceProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your advance request...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your advance request...');
    localStorage.setItem('advanceProcessing', 'true');

    try {
      await handleRequestAdvance(e);
      setStatusMessage('Advance requested successfully!');
      localStorage.removeItem('advanceProcessing');
    } catch (error) {
      setStatusMessage('Request failed. Please try again.');
      localStorage.removeItem('advanceProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" placeholder="Amount" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} required disabled={isProcessing} />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
      <button type="submit" disabled={isProcessing} aria-describedby="status-message">
        {isProcessing ? 'Processing...' : 'Request Advance'}
      </button>
      {isProcessing && <div className="spinner" aria-hidden="true"></div>}
      <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
    </form>
  );
}

export default RequestAdvance;