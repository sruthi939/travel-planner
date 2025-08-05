import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleSubmit = async () => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (!validatePassword(password)) {
      alert(
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol.'
      );
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', {
        email,
        newPassword: password,
      });

      if (response.status === 200 && response.data.success) {
        alert('Password reset successful!');
        navigate('/login');
      } else {
        alert(response.data.message || 'Password reset failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-700">Reset Password</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">
              Show password
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
