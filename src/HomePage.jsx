import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Brain, LightbulbIcon, BarChart3, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './HomePage.css';

function HomePage() {
  const [moodInput, setMoodInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const headerRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);
  const moodFormRef = useRef(null);

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(ctaRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
      });

      gsap.from(".feature-card", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        delay: 1
      });

      gsap.from(moodFormRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 1.5,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  const analyzeMood = async (e) => {
    e.preventDefault();
    if (!moodInput.trim()) {
      setError('Please enter your mood or thoughts');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setAnalysis('');
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a supportive AI assistant specializing in mental wellness. 
              Analyze the user's mood based on their input and provide a three-part response:
              1. Mood Interpretation (e.g., You seem anxious, happy, or overwhelmed)
              2. Suggested Coping Mechanisms (e.g., deep breathing, journaling, meditation)
              3. Encouraging Affirmation`
            },
            { role: "user", content: moodInput }
          ],
          max_tokens: 200
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to analyze mood');
      }
  
      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
    } catch (err) {
      setError('Error analyzing mood. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle Sign In button click to navigate to the login page
  const handleSignIn = () => {
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <Brain className="logo" />
            <span className="navbar-title">MoodTracker</span>
          </div>
          <div className="navbar-right">
            <button className="signin-button" onClick={handleSignIn}>Sign In</button>
            <button className="cta-button">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-header" ref={headerRef}>
            <h1 className="hero-title">
              Track Your Mood, Transform Your Life
            </h1>
            <p className="hero-description">
              Your personal companion for emotional wellness. Track moods, get personalized
              insights, and build better mental health habits.
            </p>
          </div>

          {/* Mood Input Section */}
          <div className="mood-form-container" ref={moodFormRef}>
            <div className="mood-form">
              <h2 className="form-title">How are you feeling today?</h2>
              <form onSubmit={analyzeMood} className="form">
                <textarea
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  placeholder="Share your thoughts and feelings..."
                  className="mood-input"
                />
                {error && <p className="error-message">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? (
                    <>
                      <Loader className="loading-icon" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze My Mood'
                  )}
                </button>
              </form>
              {analysis && (
                <div className="analysis-container">
                  <h3 className="analysis-title">Analysis & Suggestions:</h3>
                  <p className="analysis-text">{analysis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="features-grid" ref={featuresRef}>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Daily Mood Tracking</h3>
              <p className="feature-description">
                Log your emotions and track patterns over time with our intuitive interface.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <LightbulbIcon className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Personalized Insights</h3>
              <p className="feature-description">
                Get tailored recommendations and activities based on your mood patterns.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Brain className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Mental Wellness Tools</h3>
              <p className="feature-description">
                Access guided meditations, journaling prompts, and wellness exercises.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
