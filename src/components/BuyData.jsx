import React from 'react';

function BuyData({ networks, bundles, selectedNetwork, setSelectedNetwork, dataBundle, setDataBundle, phone, setPhone, pin, setPin, handleBuyData, fetchBundles }) {
  return (
    <form onSubmit={handleBuyData}>
      <select value={selectedNetwork} onChange={(e) => { setSelectedNetwork(e.target.value); fetchBundles(e.target.value); }} required>
        <option key="select-network-data" value="">Select Network</option>
        {networks.map(n => <option key={n.network_id} value={n.name}>{n.name}</option>)}
      </select>
      <select value={dataBundle} onChange={(e) => setDataBundle(e.target.value)} required>
        <option key="select-bundle" value="">Select Bundle</option>
        {bundles.map(b => <option key={b.bundle_id} value={b.bundle_id}>{b.name} - R{b.price}</option>)}
      </select>
      <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
      <button type="submit">Buy Data</button>
    </form>
  );
}

export default BuyData;