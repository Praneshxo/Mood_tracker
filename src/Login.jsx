import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Users, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Make sure you add the CSS file

function Login() {
  const [mode, setMode] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    age: undefined,
    gender: 'male'
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || undefined : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'signup') {
      // Simulate signup - no backend interaction
      console.log('Simulating signup with data:', {
        email: formData.email,
        username: formData.username,
        age: formData.age,
        gender: formData.gender
      });
      toast.success('Sign up successful! (Simulated - no account created).');
      // Optionally, you could clear the form or switch to sign-in mode here
      // setFormData({ email: '', password: '', username: '', age: undefined, gender: 'male' });
      // setMode('signin');
    } else { // mode === 'signin'
      if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
        toast.success('Successfully signed in!');
        console.log('Login successful, navigating to homepage');
        navigate('/Home');
      } else {
        toast.error('Invalid email or password.');
      }
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h2 className="form-header">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {mode === 'signin' && (
          <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.9em', color: '#333' }}>
            <p style={{ margin: '2px 0' }}>For testing purposes:</p>
            <p style={{ margin: '2px 0' }}>Email: <strong>admin@gmail.com</strong></p>
            <p style={{ margin: '2px 0' }}>Password: <strong>admin123</strong></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          {mode === 'signup' && (
            <>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <Calendar className="input-icon" size={20} />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <Users className="input-icon" size={20} />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            {/* Lock icon on the left */}
            <Lock
              className="input-icon input-icon-left"
              size={20}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field" // This field will need padding on both left and right
              required
            />
            {/* Eye icon on the right for password visibility */}
            {showPassword ? (
              <EyeOff
                className="input-icon-right"
                size={20}
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <Eye
                className="input-icon-right"
                size={20}
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>

          <button type="submit" className="submit-btn">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-mode">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="toggle-btn"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

/*
NOTE FOR Login.css:
To correctly position the icons on both sides of the password input,
you'll likely need to adjust your CSS. Here's a suggestion for your Login.css:

.input-group {
  position: relative; / Make sure this is set for absolute positioning of icons /
}

.input-field {
  / ... your existing styles ... /
  / Ensure it has padding to accommodate icons on both sides /
  padding-left: 40px;  / Example: space for left icon, adjust as needed /
  padding-right: 40px; / Example: space for right icon, adjust as needed /
}

/ Base styles for icons, if not already defined in .input-icon /
.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #888; / Or your preferred icon color /
}

.input-icon-left {
  left: 12px; / Adjust horizontal position for the left icon /
}

.input-icon-right {
  right: 12px; / Adjust horizontal position for the right icon /
}

.clickable-icon {
  cursor: pointer;
}
*/

export default Login;
