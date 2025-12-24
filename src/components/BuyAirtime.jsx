import React from 'react';

function BuyAirtime({ networks, denominations, selectedNetwork, setSelectedNetwork, airtimeAmount, setAirtimeAmount, phone, setPhone, pin, setPin, handleBuyAirtime }) {
  return (
    <form onSubmit={handleBuyAirtime}>
      <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} required>
        <option key="select-network" value="">Select Network</option>
        {networks.map(n => <option key={n.network_id} value={n.name}>{n.name}</option>)}
      </select>
      <select value={airtimeAmount} onChange={(e) => setAirtimeAmount(e.target.value)} required>
        <option key="select-amount" value="">Select Amount</option>
        {denominations.map(d => <option key={d} value={d}>R{d}</option>)}
      </select>
      <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
      <button type="submit">Buy Airtime</button>
    </form>
  );
}

export default BuyAirtime;