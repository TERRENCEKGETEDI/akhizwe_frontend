import React from 'react';

function TopUpWallet({ topUpAmount, setTopUpAmount, paymentMethod, setPaymentMethod, pin, setPin, handleTopUp }) {
  return (
    <form onSubmit={handleTopUp}>
      <input type="number" placeholder="Amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} required />
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option key="card" value="card">Card</option>
        <option key="bank" value="bank">Bank Transfer</option>
      </select>
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
      <button type="submit">Top Up</button>
    </form>
  );
}

export default TopUpWallet;