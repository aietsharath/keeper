import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import CustomButton from './CustomButton'; // styled like your UI

const AuthScreen = () => {
  const [step, setStep] = useState('signup'); // 'signup', 'verify', or 'manual'
  const [form, setForm] = useState({
    phone: '',
    email: '',
    password: '',
    name: '',
    pincode: '',
    age: '',
    gender: '',
    otp: ''
  });
  const [session, setSession] = useState(null);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOTP = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: form.phone
    });
    if (error) alert(error.message);
    else setStep('verify');
  };

  const verifyOTP = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: form.phone,
      token: form.otp,
      type: 'sms'
    });

    if (data?.session) {
      
      setSession(data.session);

      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email || '',
        name: form.name,
        pincode: form.pincode,
        age: form.age,
        gender: form.gender
      });
    } else {
      alert(error.message);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  };

  const handleManualSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (error) {
      alert(error.message);
    } else {
      
      // insert profile metadata
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        name: form.name,
        pincode: form.pincode,
        age: form.age,
        gender: form.gender
      });
      alert('Sign up successful. Please check your email to confirm.');
    }
  };

  return (
    <div className="absolute top-0 left-0 flex justify-center items-center min-h-screen w-full bg-white z-50">
      <div className="p-6 rounded-xl shadow-xl bg-gray-100 w-full max-w-md space-y-4">

        {step === 'signup' && (
          <>
            <h2 className="text-xl font-bold">Sign Up</h2>
            <input name="phone" value={form.phone} onChange={handleInput} placeholder="Phone" className="p-2 w-full rounded border" />
            <input name="email" value={form.email} onChange={handleInput} placeholder="Email (optional)" className="p-2 w-full rounded border" />
            <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="p-2 w-full rounded border" />
            <input name="pincode" value={form.pincode} onChange={handleInput} placeholder="Pincode" className="p-2 w-full rounded border" />
            <input name="age" value={form.age} onChange={handleInput} placeholder="Age" className="p-2 w-full rounded border" />
            <select name="gender" value={form.gender} onChange={handleInput} className="p-2 w-full rounded border">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <CustomButton title="Send OTP" handleClick={sendOTP} />
            <CustomButton title="Continue with Google" handleClick={loginWithGoogle} />
            <CustomButton title="Manual Sign Up" handleClick={() => setStep('manual')} />
          </>
        )}

        {step === 'manual' && (
          <>
            <h2 className="text-xl font-bold">Manual Sign Up</h2>
            <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="p-2 w-full rounded border" />
            <input name="password" value={form.password} onChange={handleInput} placeholder="Password" type="password" className="p-2 w-full rounded border" />
            <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="p-2 w-full rounded border" />
            <input name="pincode" value={form.pincode} onChange={handleInput} placeholder="Pincode" className="p-2 w-full rounded border" />
            <input name="age" value={form.age} onChange={handleInput} placeholder="Age" className="p-2 w-full rounded border" />
            <select name="gender" value={form.gender} onChange={handleInput} className="p-2 w-full rounded border">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <CustomButton title="Submit Manual Sign Up" handleClick={handleManualSignup} />
            <CustomButton title="Back to OTP Sign Up" handleClick={() => setStep('signup')} />
          </>
        )}

        {step === 'verify' && (
          <>
            <input name="otp" value={form.otp} onChange={handleInput} placeholder="Enter OTP" className="p-2 w-full rounded border" />
            <CustomButton title="Verify OTP" handleClick={verifyOTP} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
