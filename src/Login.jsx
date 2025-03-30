import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Users } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
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

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || undefined : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              user_id: authData.user.id,
              username: formData.username,
              age: formData.age,
              gender: formData.gender
            });

          if (profileError) throw profileError;
        }

        toast.success('Sign up successful! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        toast.success('Successfully signed in!');
        console.log('Login successful, navigating to homepage');
        
        // Navigate to homepage after successful login
        navigate('/');  // This should work, provided the route is set up correctly
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h2 className="form-header">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>

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
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              required
            />
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

export default Login;
