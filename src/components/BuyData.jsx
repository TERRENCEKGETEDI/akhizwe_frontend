import React, { useState, useEffect } from 'react';
import './BuyData.css';

function BuyData({ networks, bundles, selectedNetwork, setSelectedNetwork, dataBundle, setDataBundle, phone, setPhone, pin, setPin, handleBuyData, fetchBundles }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const processing = localStorage.getItem('dataProcessing');
    if (processing === 'true') {
      setIsProcessing(true);
      setStatusMessage('Processing your data purchase...');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Processing your data purchase...');
    localStorage.setItem('dataProcessing', 'true');

    try {
      await handleBuyData(e);
      setStatusMessage('Purchase completed successfully!');
      localStorage.removeItem('dataProcessing');
    } catch (error) {
      setStatusMessage('Purchase failed. Please try again.');
      localStorage.removeItem('dataProcessing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedNetwork} onChange={(e) => { setSelectedNetwork(e.target.value); fetchBundles(e.target.value); }} required disabled={isProcessing}>
        <option key="select-network-data" value="">Select Network</option>
        {networks.map(n => <option key={n.network_id} value={n.name}>{n.name}</option>)}
      </select>
      <select value={dataBundle} onChange={(e) => setDataBundle(e.target.value)} required disabled={isProcessing}>
        <option key="select-bundle" value="">Select Bundle</option>
        {bundles.map(b => <option key={b.bundle_id} value={b.bundle_id}>{b.name} - R{b.price}</option>)}
      </select>
      <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isProcessing} />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required disabled={isProcessing} />
      <button type="submit" disabled={isProcessing} aria-describedby="status-message">
        {isProcessing ? 'Processing...' : 'Buy Data'}
      </button>
      {isProcessing && <div className="spinner" aria-hidden="true"></div>}
      <div id="status-message" aria-live="polite" className="sr-only">{statusMessage}</div>
    </form>
  );
}

export default BuyData;