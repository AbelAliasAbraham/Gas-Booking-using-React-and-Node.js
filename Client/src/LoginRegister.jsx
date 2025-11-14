import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer'; // ✅ FIX: Must import the Footer component
import { useAuth } from './useAuth'; 

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
const phoneRegex = /^[0-9]{10}$/;

const LoginRegister = () => {
  const { login } = useAuth();
  const [activeForm, setActiveForm] = useState('login'); 

  // State for all form fields
  const [loginState, setLoginState] = useState({ emailOrPhone: '', password: '' });
  const [registerState, setRegisterState] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [forgotState, setForgotState] = useState({ emailOrPhone: '' });
  
  // Handlers for input changes - NOW USING e.target.name
  const handleLoginChange = (e) => setLoginState({ ...loginState, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterState({ ...registerState, [e.target.name]: e.target.value });
  const handleForgotChange = (e) => setForgotState({ ...forgotState, [e.target.name]: e.target.value });

  // ... (handleLogin, handleRegister, handleForgot remain the same) ...
  const handleLogin = async (e) => {
    e.preventDefault();
    const { emailOrPhone, password } = loginState;

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ emailOrPhone, password })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      login(data.token);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirm } = registerState;

    if (name.length < 3) return alert("Name must be 3+ chars");
    if (!emailRegex.test(email)) return alert("Invalid email");
    if (!phoneRegex.test(phone)) return alert("Phone must be 10 digits");
    if (!passwordRegex.test(password)) return alert("Password must include 6+ chars, number & special char");
    if (password !== confirm) return alert("Passwords do not match");

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setActiveForm('login');
      setRegisterState({ name: '', email: '', phone: '', password: '', confirm: '' });
    }
  };
  
  const handleForgot = async (e) => {
    e.preventDefault();
    const { emailOrPhone } = forgotState;

    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ emailOrPhone })
    });
    const data = await res.json();
    alert(`${data.message}\nToken: ${data.resetToken || ""}`);
  };


  return (
    <>
      <Header />
      <section className="hero">
        <div className="wrapper">
          
          {/* Login Form */}
          {activeForm === 'login' && (
            <div className="card" id="login-form">
              <h1>Login</h1>
              <form onSubmit={handleLogin}>
                {/* 1. Use name="emailOrPhone" to match loginState key */}
                <input type="text" name="emailOrPhone" placeholder="Email or Phone" required onChange={handleLoginChange} value={loginState.emailOrPhone} />
                {/* 2. Use name="password" to match loginState key */}
                <input type="password" name="password" placeholder="Password" required onChange={handleLoginChange} value={loginState.password} />
                <p><span id="show-forgot" onClick={() => setActiveForm('forgot')}>Forgot Password?</span></p>
                <button type="submit">Login</button>
                <p>New user? <span id="show-register" onClick={() => setActiveForm('register')}>Register here</span></p>
              </form>
            </div>
          )}

          {/* Register Form */}
          {activeForm === 'register' && (
            <div className="card" id="register-form">
              <h1>Register</h1>
              <form onSubmit={handleRegister}>
                {/* 3. Use name="name" to match registerState key */}
                <input type="text" name="name" placeholder="Full Name" required onChange={handleRegisterChange} value={registerState.name} />
                {/* 4. Use name="email" to match registerState key */}
                <input type="email" name="email" placeholder="Email" required onChange={handleRegisterChange} value={registerState.email} />
                {/* 5. Use name="phone" to match registerState key */}
                <input type="text" name="phone" placeholder="Phone Number" required onChange={handleRegisterChange} value={registerState.phone} />
                {/* 6. Use name="password" to match registerState key */}
                <input type="password" name="password" placeholder="Password" required onChange={handleRegisterChange} value={registerState.password} />
                {/* 7. Use name="confirm" to match registerState key */}
                <input type="password" name="confirm" placeholder="Confirm Password" required onChange={handleRegisterChange} value={registerState.confirm} />
                <button type="submit">Register</button>
                <p>Already have an account? <span id="show-login" onClick={() => setActiveForm('login')}>Login here</span></p>
              </form>
            </div>
          )}

          {/* Forgot Password Form */}
          {activeForm === 'forgot' && (
            <div className="card" id="forgot-form">
              <h1>Forgot Password</h1>
              <form onSubmit={handleForgot}>
                {/* 8. Use name="emailOrPhone" to match forgotState key */}
                <input type="text" name="emailOrPhone" placeholder="Email or Phone" required onChange={handleForgotChange} value={forgotState.emailOrPhone} />
                <button type="submit">Send Reset Token</button>
                <p><span id="show-login-2" onClick={() => setActiveForm('login')}>Back to Login</span></p>
              </form>
            </div>
          )}
        </div>
      </section>
      <Footer /> {/* ✅ Add Footer */}
    </>
  );
};

export default LoginRegister;