import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Track Remember Me checkbox state
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8888/project2025/login.php', {
        username,
        password,
      });

      if (response.data.success) {
        setLoading(false);
        localStorage.setItem('user_id', response.data.user_id); // Store user ID
        onLoginSuccess(); // Trigger callback on success
        navigate('/'); // Redirect after successful login
      } else {
        setLoading(false);
        setErrorMessage('Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error during login:', error);
      setErrorMessage('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* Add Logo */}
      <img src="http://sahiljasuja.com/wp-content/uploads/2024/07/Sahil-Jasuja-2.png" alt="Logo" />

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember Me checkbox */}
        <div className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {errorMessage && <p className="error">{errorMessage}</p>}

        {/* Sign Up and Forgot Password Links */}
        <div className="login-links">
          <a href="/forgot-password">Forgot Password?</a>
          <a href="/sign-up">Sign Up</a>
        </div>
      </form>

      {/* Footer for additional links */}
      <div className="footer">
        <p>Privacy Policy • Terms of Service • Contact Us</p>
        <p>© 2024 Sahil Jasuja, Inc. All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Login;
