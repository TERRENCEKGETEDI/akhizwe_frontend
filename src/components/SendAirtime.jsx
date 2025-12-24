import React from 'react';

function SendAirtime({ balance, phone, setPhone, airtimeAmount, setAirtimeAmount, pin, setPin, handleSendAirtime }) {
  return (
    <div>
      <p>Available Airtime: {balance.toFixed(2)}</p>
      <form onSubmit={handleSendAirtime}>
        <input type="text" placeholder="Recipient Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="number" placeholder="Amount" value={airtimeAmount} onChange={(e) => setAirtimeAmount(e.target.value)} required />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
        <button type="submit">Send Airtime</button>
      </form>
    </div>
  );
}

export default SendAirtime;