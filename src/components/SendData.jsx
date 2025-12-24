import React from 'react';

function SendData({ phone, setPhone, pin, setPin, handleSendData, dataBalance, dataAmount, setDataAmount }) {
  return (
    <div>
      <p>Available Data: {((dataBalance || 0) > 1024 ? ((dataBalance || 0) / 1024).toFixed(2) + ' GB' : (dataBalance || 0).toFixed(2) + ' MB')}</p>
      <form onSubmit={handleSendData}>
        <input type="number" placeholder="Data Amount (MB)" value={dataAmount} onChange={(e) => setDataAmount(e.target.value)} required min="0" step="0.01" />
        <input type="text" placeholder="Recipient Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
        <button type="submit">Send Data</button>
      </form>
    </div>
  );
}

export default SendData;