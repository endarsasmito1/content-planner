import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword(email);
        setSent(true);
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email associated with your account.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary auth-btn">Send Reset Link</button>
                    </form>
                ) : (
                    <div className="success-message">
                        <div className="icon-check">✓</div>
                        <h3>Check your email</h3>
                        <p>We've sent password reset instructions to <b>{email}</b></p>
                        <button className="btn-primary auth-btn" onClick={() => setSent(false)}>Resend Email</button>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="text-primary">Back to Sign In</Link>
                </div>
            </div>

            <style>{`
        .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F5F6FA;
            padding: 20px;
        }
        .auth-card {
            width: 100%;
            max-width: 450px;
            padding: 40px;
        }
        .auth-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .auth-header h2 { font-size: 24px; margin-bottom: 8px; }
        .auth-header p { color: var(--text-secondary); }
        
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
        }
        .form-input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid #E0E5F2;
            background: #F8F9FC;
            font-size: 14px;
        }
        .form-input:focus {
            border-color: var(--color-primary);
            background: white;
        }
        .auth-btn { width: 100%; padding: 14px; }
        
        .auth-footer {
            margin-top: 24px;
            text-align: center;
            font-size: 14px;
        }
        .auth-footer a { font-weight: 600; }

        .success-message {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .icon-check {
            width: 60px;
            height: 60px;
            background: #E5F9F1;
            color: #05CD99;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
       `}</style>
        </div>
    );
};

export default ForgotPassword;
