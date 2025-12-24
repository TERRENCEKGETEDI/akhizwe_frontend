import React from 'react';

function RequestAdvance({ advanceAmount, setAdvanceAmount, pin, setPin, handleRequestAdvance }) {
  return (
    <form onSubmit={handleRequestAdvance}>
      <input type="number" placeholder="Amount" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} required />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
      <button type="submit">Request Advance</button>
    </form>
  );
}

export default RequestAdvance;