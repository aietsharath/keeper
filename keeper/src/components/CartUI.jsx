import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // adjust path as needed

const CartUI = ({ cartItems, onClose, onConfirmPayment }) => {
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
  const [addressForm, setAddressForm] = useState({
    pincode: '', city: '', district: '', state: '',
    detailedAddress: '', houseNo: '', street: '', landmark: '',
    mobile: '', otp: '', isMobileVerified: false, age: '', gender: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  if (!cartItems.length) return null;

  const upiId = "nssharath226-1@okhdfcbank";
  const payeeName = "Mr Sharath";
  const amount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const transactionRef = `TXN${Date.now()}`;
  const gpayDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tr=${transactionRef}`;

  // Fetch address by pincode
  const fetchAddressFromPincode = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        setAddressForm(prev => ({
          ...prev,
          district: po.District,
          state: po.State,
          city: po.Name
        }));
        setPincodeError('');
      } else {
        setPincodeError('Invalid pincode');
      }
    } catch (error) {
      setPincodeError('Error fetching address');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
    if (name === 'pincode' && value.length === 6) {
      fetchAddressFromPincode(value);
    }
  };

  // Send OTP
  const sendOtp = async () => {
    if (!addressForm.mobile.startsWith('+91')) {
      alert('Please enter mobile number in +91XXXXXXXXXX format');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: addressForm.mobile,
    });
    setLoading(false);
    if (error) {
      alert('Failed to send OTP: ' + error.message);
    } else {
      alert('OTP sent to your mobile!');
      setOtpSent(true);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: addressForm.mobile,
      token: addressForm.otp,
      type: 'sms',
    });
    setLoading(false);
    if (error) {
      alert('OTP verification failed: ' + error.message);
    } else {
      alert('Mobile number verified!');
      setAddressForm(prev => ({ ...prev, isMobileVerified: true }));
    }
  };

  // Submit address data to Supabase
  const submitAddressToSupabase = async () => {
    const { error } = await supabase.from('orders').insert([{
      pincode: addressForm.pincode,
      city: addressForm.city,
      district: addressForm.district,
      state: addressForm.state,
      detailed_address: addressForm.detailedAddress,
      house_no: addressForm.houseNo,
      street: addressForm.street,
      landmark: addressForm.landmark,
      mobile: addressForm.mobile,
      age: addressForm.age,
      gender: addressForm.gender,
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      alert('Failed to save address: ' + error.message);
      return false;
    }
    return true;
  };

  return (
    <>
      {/* 🛒 Cart Panel */}
      <div style={{ position: 'fixed', right: '20px', top: '60px', background: 'white', border: '1px solid #ccc', padding: '20px', width: '320px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>Cart Details <button onClick={onClose} style={{ float: 'right' }}>X</button></h2>
        <ul>
          {cartItems.map(item => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              <strong>{item.name}</strong><br/>
              Color: {item.color}<br/>
              Size: {item.size}<br/>
              Qty: {item.quantity}<br/>
              Price: ₹{item.price * item.quantity}
            </li>
          ))}
        </ul>
        <hr/>
        <p><strong>Total: ₹{amount}</strong></p>
        <button style={{ padding: '10px 20px', backgroundColor: '#3fcc5a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => setIsAddressFormVisible(true)}>
          Enter Details Before Checkout
        </button>
      </div>

      {/* 📋 Address Form Modal */}
      {isAddressFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold">Enter Delivery Details</h2>

            {['pincode', 'city', 'district', 'state', 'detailedAddress', 'houseNo', 'street', 'landmark', 'mobile', 'age'].map(field => (
              <input
                key={field}
                name={field}
                value={addressForm[field]}
                onChange={handleInputChange}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                className="p-2 w-full rounded border"
                readOnly={['city', 'district', 'state'].includes(field)}
              />
            ))}

            {pincodeError && <p className="text-red-500 text-sm">{pincodeError}</p>}

            <select name="gender" value={addressForm.gender} onChange={handleInputChange} className="p-2 w-full rounded border">
              <option value="">Select Gender</option>
              {['male','female','other'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>

            {!addressForm.isMobileVerified ? (
              !otpSent ? (
                <button onClick={sendOtp} disabled={loading} className="bg-yellow-500 text-white rounded-md py-2 w-full">
                  {loading ? 'Sending OTP...' : 'Send OTP to Verify'}
                </button>
              ) : (
                <>
                  <input type="text" placeholder="Enter OTP" value={addressForm.otp} onChange={e => setAddressForm(prev => ({ ...prev, otp: e.target.value }))} className="p-2 w-full rounded border"/>
                  <button onClick={verifyOtp} disabled={loading} className="bg-green-600 text-white rounded-md py-2 w-full">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </>
              )
            ) : (
              <p className="text-green-600">✅ Mobile number verified</p>
            )}

            <a
              href={gpayDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-center py-2 rounded-md text-white font-bold ${addressForm.isMobileVerified ? 'bg-green-600' : 'bg-gray-400 pointer-events-none'}`}
              onClick={async (e) => {
                if (addressForm.isMobileVerified) {
                  e.preventDefault();
                  const saved = await submitAddressToSupabase();
                  if (saved) {
                    alert('Redirecting to Google Pay...');
                    onConfirmPayment?.();
                    setIsAddressFormVisible(false);
                    window.open(gpayDeepLink, '_blank');
                  }
                }
              }}
            >
              Pay with Google Pay
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default CartUI;
