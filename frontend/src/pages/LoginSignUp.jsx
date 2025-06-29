import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const LoginSignUp = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agreeTnC: false
  });
  const [showError, setShowError] = useState(false);

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setShowError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if it's signup and terms are not accepted
    if (state === "Sign Up") {
      if (!formData.agreeTnC) {
        setShowError(true);
        return;
      }
    }

    // Proceed with login or signup
    if (state === "Login") {
      await login();
    } else {
      await signup();
    }
  };

  const login = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method:'POST',
      headers:{
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Login failed');
      return;
    }
    alert('Login successful!');
    localStorage.setItem('auth-token',data.token);
    window.location.replace("/"); 
  };

  const signup = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Signup failed');
      return;
    }
    alert(data.message); // or handle success
    localStorage.setItem('auth-token',data.token);
    window.location.replace("/"); 
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <form onSubmit={handleSubmit} className={state === "Sign Up" ? "signup" : "login"}>
          <div className="loginsignup-fields">
            {state==="Sign Up" && 
              <input 
                name="username" 
                value={formData.username} 
                onChange={changeHandler} 
                type="text" 
                placeholder='Your Name' 
              />
            }
            <input 
              name='email' 
              value={formData.email} 
              onChange={changeHandler}  
              type="email" 
              placeholder='Email Address' 
              required 
            />
            <input 
              name='password' 
              value={formData.password} 
              onChange={changeHandler} 
              type="password" 
              placeholder='Password' 
              required 
            />
          </div>
          {state === "Sign Up" && (
            <div className={`loginsignup-agree ${showError ? 'warning' : ''}`}>
              <input 
                type="checkbox" 
                id="agreeTnC"
                checked={formData.agreeTnC}
                onChange={(e) => {
                  setFormData({...formData, agreeTnC: e.target.checked});
                  setShowError(false);
                }}
              />
              <p>By continuing, I agree to the terms of use & privacy policy.</p>
            </div>
          )}
          {showError && (
            <p className="error-message">Please accept the terms and privacy policy to continue.</p>
          )}
          <button type="submit">Continue</button>
        </form>
        {state === "Sign Up" ? 
          <p className="loginsignup-login">
            Already have an account? <span onClick={() => setState("Login")}>Login here</span>
          </p>
          :
          <p className="loginsignup-login">
            Create an account? <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        }
      </div>
    </div>
  );
};

export default LoginSignUp