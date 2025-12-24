import React from 'react';

function TransactionHistory({ transactions }) {
  return (
    <div>
      <h3>Transaction History</h3>
      <ul>
        {transactions.map(t => (
          <li key={t.transaction_ref}>
            {t.transaction_type} - R{t.amount} - {t.status} - {new Date(t.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionHistory;