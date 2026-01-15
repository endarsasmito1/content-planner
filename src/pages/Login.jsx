import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // 'success' or 'error'

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, location.state.type || 'success');
      // Clear state so it doesn't show again on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(username, password);
      if (result.success) {
        showToast('Login Successful! Redirecting...', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1000); // Wait a bit for user to see toast
      } else {
        showToast(result.message || 'Invalid username or password', 'error');
      }
    } catch (err) {
      showToast('Login failed. Please try again.', 'error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-left">
          <h1>Content Planner</h1>
          <p>Sistem manajemen konten untuk perencanaan, produksi, monitoring, dan evaluasi.</p>
          <p>Membantu tim bekerja lebih terstruktur, transparan, dan efisien.</p>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Sign in</h2>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="forgot-password-link">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
              </div>

              <button type="submit" className="btn-primary">Log in now</button>
            </form>

            <div className="link-create">
              Don't have an account? <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        /* Toast Notifications */
        .toast-notification {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 50px;
            background: white;
            color: #202124; /* Google's near-black for visibility */
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
            min-width: 300px;
        }
        
        @keyframes slideDown {
            from { top: -50px; opacity: 0; }
            to { top: 24px; opacity: 1; }
        }
        
        .toast-notification.success {
            border-left: 4px solid #05CD99;
        }
        
        .toast-notification.error {
            border-left: 4px solid #EE5D50;
        }
        
        .toast-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        
        .toast-notification.success .toast-icon {
            background: #05CD99;
        }
        
        .toast-notification.error .toast-icon {
            background: #EE5D50;
        }

        .login-page {
          background: var(--color-primary);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .login-content {
          display: flex;
          width: 100%;
          max-width: 1200px;
          padding: 40px;
          align-items: center;
          justify-content: space-between;
        }

        .login-left {
          flex: 1;
          padding-right: 60px;
        }
        
        .login-left h1 {
          font-size: 48px;
          margin-bottom: 20px;
          color: white;
        }
        
        .login-left p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 8px;
            line-height: 1.6;
            max-width: 500px;
        }

        .login-right {
          flex: 0 0 420px;
        }

        .login-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          color: var(--text-main);
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        .login-card h2 {
          margin-bottom: 30px;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }
        
        .forgot-password-link {
            text-align: right;
            margin-top: 8px;
        }
        
        .forgot-password-link a {
            font-size: 13px;
            color: var(--color-primary);
            font-weight: 600;
            text-decoration: none;
        }
        
        .forgot-password-link a:hover {
            text-decoration: underline;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: #F8F9FA; /* Off-white background */
          border: 1px solid #E0E0E0; /* Visible border */
          color: var(--text-main);
          transition: all 0.2s;
        }
        
        .password-input-wrapper {
            position: relative;
        }
        
        .password-input-wrapper .form-input {
            padding-right: 40px; /* Space for eye icon */
        }
        
        .toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
        }
        
        .toggle-password:hover {
            color: var(--color-primary);
        }
        
        .form-input:focus {
            background: white;
            border-color: var(--color-primary);
            outline: none;
            box-shadow: 0 0 0 4px var(--color-primary-bg);
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: var(--color-primary);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          margin-top: 10px;
          transition: all 0.2s ease-in-out;
          border: none;
          cursor: pointer;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 53, 222, 0.3);
        }
        
        .link-create {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: var(--text-secondary);
            font-size: 14px;
        }
        .link-create a {
            color: var(--color-primary);
            font-weight: 700;
            margin-left: 4px;
            text-decoration: none;
        }
        .link-create a:hover {
            text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
