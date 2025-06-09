const GPayButton = () => {
  const handleClick = () => {
    const upiUrl = `upi://pay?pa=nssharath226-1@okhdfcbank&pn=Mr. Sharath&tn=Payment for Order&am=1&cu=INR`;
    window.location.href = upiUrl;
  };

  return (
    <button onClick={handleClick} className="bg-green-500 text-white px-4 py-2 rounded">
      Pay with Google Pay
    </button>
  );
};

export default GPayButton;