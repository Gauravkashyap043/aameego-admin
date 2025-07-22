import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/aameego_full_logo.png";
import { useAdminLogin } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [step, setStep] = React.useState<'input' | 'otp'>('input');
  const [input, setInput] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const adminLoginMutation = useAdminLogin();

  const handleRequestOtp = async () => {
    if (!input) {
      setError('Please enter your phone or email');
      return;
    }
    setError('');
    // For admin login, just go to OTP step (no register API call)
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    try {
      const response = await adminLoginMutation.mutateAsync({ identifier: input, otp });
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to verify OTP');
    }
  };

  const loading = adminLoginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col items-center">
        {/* Logo with background */}
        <div className="h-16 w-full  bg-indigo-600 flex items-center justify-center mb-4 rounded-t-2xl ">
          <img src={logo} alt="Aameego Logo" className="h-10 w-auto" />
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-1 text-center">Sign in to Aameego</h2>
          <div className="text-gray-500 mb-6 text-center text-sm">Welcome! Enter your phone or email to get started.</div>
          {step === 'input' ? (
            <>
              <input
                type="text"
                placeholder="Enter phone or email"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
              />
              {error && <div className="text-red-500 text-sm mb-2 w-full text-left">{error}</div>}
              <button
                onClick={handleRequestOtp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Request OTP'}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
              />
              {error && <div className="text-red-500 text-sm mb-2 w-full text-left">{error}</div>}
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 