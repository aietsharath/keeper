import React from 'react';

const CartUI = ({ cartItems, onClose, onConfirmPayment }) => {
  if (!cartItems.length) return null;

  // Build UPI deep link for GPay
  const upiId = "nssharath226-1@okhdfcbank"; // Replace with your actual UPI ID
  const payeeName = "Mr Sharath";
  const amount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const transactionRef = `TXN${Date.now()}`;

  // UPI deep link format for GPay:
  // Example: upi://pay?pa=upiId&pn=payeeName&am=amount&cu=INR&tr=txnRef
  const gpayDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tr=${transactionRef}`;

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '60px',
        background: 'white',
        border: '1px solid #ccc',
        padding: '20px',
        width: '320px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h2>Cart Details</h2>
      <button onClick={onClose} style={{ float: 'right' }}>X</button>

      <ul>
        {cartItems.map((item) => (
          <li key={item.id} style={{ marginBottom: '10px' }}>
            <strong>{item.name}</strong><br />
            Color: {item.color} <br />
            Size: {item.size} <br />
            Qty: {item.quantity} <br />
            Price: ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>

      <hr />
      <p><strong>Total: ₹{amount}</strong></p>

      <a
        href={gpayDeepLink}
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#3fcc5a',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          marginTop: '10px',
        }}
        onClick={() => {
          // Note: This opens GPay. After payment, user returns to app.
          // You may want to handle confirmation with server/webhooks in a real app.
          alert('Redirecting to Google Pay for payment');
        }}
      >
        Pay with Google Pay
      </a>

      {/* A fallback confirm button for demo */}
      <button
        onClick={onConfirmPayment}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Confirm Order (Demo)
      </button>
    </div>
  );
};

export default CartUI;
