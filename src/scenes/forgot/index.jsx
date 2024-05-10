
// ResetPasswordForm.jsx
import React, { useState } from 'react';
import { FaLock, FaKey } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import '../LoginForm/LoginForm.css'

const ResetPasswordForm = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Remplacez par votre API de réinitialisation de mot de passe
      const response = await fetch('http://localhost:3001/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert('Password has been reset successfully');
        navigate('/'); // Ou naviguez vers la page que vous souhaitez après la réinitialisation
      } else {
        alert('Error: ' + (data.message || 'Could not reset password'));
      }
    } catch (error) {
      alert('Error resetting password');
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <div className="input-box">
          <input 
            type="text" 
            placeholder='Enter your reset token' 
            required 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
          />
          <FaKey className='icon' />
        </div>
        <div className="input-box">
          <input 
            type="password" 
            placeholder='Enter your new password' 
            required 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
          />
          <FaLock className='icon'/>
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;