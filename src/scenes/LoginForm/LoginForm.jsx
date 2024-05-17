import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () =>
{
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://nodeapp-0ome.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
  
      if (response.status === 200) {
        // Stockez le token dans localStorage ou un contexte de gestion d'état global si vous utilisez Redux ou Context API
        localStorage.setItem('token', data.accessToken);
       
        navigate('/dashboard');
      } else if (response.status === 401) {
        // Code d'état HTTP 401 indique une authentification non réussie (mauvais identifiant ou mot de passe)
        alert('Login failed: Incorrect email or password.');
      } else {
        // Toute autre réponse non réussie du serveur
        alert(`Login failed: ${data.message || 'An unspecified error occurred.'}`);
      }
    } catch (error) {
      // Une erreur est survenue lors de la connexion au serveur ou de la réception de la réponse
      alert('Server connection error.');
    }
  };
  
  const handleForgotPassword = () => {
    console.log('Redirection to  forgotPassword');
    navigate('/password');
  };
    
    return (
        <div className='wrapper'> 
        <form  onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div className="input-box">
            <input type="text" placeholder='email' required  
            value={email} onChange={(e) => setEmail(e.target.value)} 
                       />
            
            </div>
            <div className="input-box">
            <input type="password" placeholder='Password' required  value={password} onChange={(e) => setPassword(e.target.value)}
             
              />
            
            </div>
            <div className="remember-forgot">
                <label ><input type="checkbox" />Remember me</label>
                <a href="#" onClick={handleForgotPassword}> Forgot password ? </a>
            </div>
            <button type="submit">Login</button>
            
        </form>
        </div>
        

    )
}
export default LoginForm  ;