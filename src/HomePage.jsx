import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Brain, LightbulbIcon, BarChart3, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Assuming you have this CSS file for styling

function App() { // Renamed HomePage to App for consistency with React main component naming
  const [moodInput, setMoodInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableModel, setAvailableModel] = useState(null); // State to store the dynamically found model

  const headerRef = useRef(null);
  const ctaRef = useRef(null);
  const moodFormRef = useRef(null);

  const navigate = useNavigate();

  // GSAP Animations for UI elements
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".cta-button", {
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

  // Function to dynamically find an available model that supports generateContent
  const getAvailableModel = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
      }

      // Fetch the list of models from the v1 endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error listing models:", errorData);
        throw new Error(`Failed to list models: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Available Models:", data.models);

      // Prioritize gemini-pro, then gemini-2.0-flash, or any other suitable text model
      const preferredModels = ["gemini-pro", "gemini-2.0-flash"];
      let foundModel = null;

      if (data.models && Array.isArray(data.models)) {
        for (const modelName of preferredModels) {
          foundModel = data.models.find(model =>
            model.name.includes(modelName) &&
            model.supportedGenerationMethods &&
            model.supportedGenerationMethods.includes("generateContent")
          );
          if (foundModel) {
            console.log(`Found preferred model: ${foundModel.name}`);
            return foundModel.name; // Return the full model name, e.g., "models/gemini-pro"
          }
        }

        // If preferred models not found, try to find any model that supports generateContent
        if (!foundModel) {
          foundModel = data.models.find(model =>
            model.supportedGenerationMethods &&
            model.supportedGenerationMethods.includes("generateContent")
          );
          if (foundModel) {
            console.warn(`Preferred models not found. Using fallback model: ${foundModel.name}`);
            return foundModel.name;
          }
        }
      }

      throw new Error("No suitable generative AI model found that supports 'generateContent'.");

    } catch (err) {
      console.error("Error getting available model:", err);
      setError(`Initialization error: ${err.message}`);
      return null;
    }
  };

  // Effect to discover the model on component mount
  useEffect(() => {
    const initializeModel = async () => {
      const model = await getAvailableModel();
      if (model) {
        // Extract just the model ID (e.g., "gemini-pro" from "models/gemini-pro")
        setAvailableModel(model.split('/')[1]);
      } else {
        // If no model found, set an error to prevent further API calls
        setError("Could not find an available AI model for analysis. Please check your API key and project settings.");
      }
    };
    initializeModel();
  }, []); // Run once on mount

  // Function to analyze mood using the discovered model
  const analyzeMood = async (e) => {
    e.preventDefault();
    if (!moodInput.trim()) {
      setError('Please enter your mood or thoughts.');
      return;
    }
    if (!availableModel) {
      setError('AI model not initialized. Please wait or refresh.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing. Cannot proceed with analysis.");
      }

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a supportive AI assistant specializing in mental wellness.
                Analyze the user's mood based on their input and provide a three-part response:
                1. Mood Interpretation (e.g., You seem anxious, happy, or overwhelmed)
                2. Suggested Coping Mechanisms (e.g., deep breathing, journaling, meditation)
                3. Encouraging Affirmation
                
                User Input: ${moodInput}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
        },
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${availableModel}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response Data:", errorData);
        const errorMessage = errorData.error?.message || `Failed to analyze mood: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Successful API Response Data:", data);

      if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const firstCandidate = data.candidates[0];

        if (firstCandidate.content && firstCandidate.content.parts && Array.isArray(firstCandidate.content.parts) && firstCandidate.content.parts.length > 0) {
          const firstPart = firstCandidate.content.parts[0];

          if (firstPart.text) {
            const generatedText = firstPart.text;
            setAnalysis(generatedText);
          } else {
            console.error("API Response Error: Missing 'text' in response part.", firstPart);
            if (firstCandidate.finishReason === 'SAFETY' || (firstCandidate.safetyRatings && firstCandidate.safetyRatings.some(rating => rating.blocked))) {
                throw new Error("Content was blocked due to safety concerns. Please try rephrasing your input.");
            }
            throw new Error("Unexpected response format from the API: Generated text is missing.");
          }
        } else {
          console.error("API Response Error: Missing 'content' or 'parts' in response.", firstCandidate);
          throw new Error("Unexpected response format from the API: Missing content structure.");
        }
      } else {
        if (data.promptFeedback && data.promptFeedback.blockReason) {
            throw new Error(`Your input was blocked due to: ${data.promptFeedback.blockReason}. Please adjust your input.`);
        }
        console.error("API Response Error: Missing 'candidates' in response.", data);
        throw new Error("Unexpected response format from the API: No valid candidates found.");
      }
    } catch (err) {
      console.error("Caught error during mood analysis:", err);
      setError(`Error analyzing mood: ${err.message || 'Please try again later.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/');
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
            <button className="cta-button" ref={ctaRef}>Get Started</button>
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
                  disabled={!availableModel || isLoading} // Disable if model not found or loading
                />
                {error && <p className="error-message">{error}</p>}
                {!availableModel && !error && (
                  <p className="loading-model-message">Discovering AI model...</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !availableModel} // Disable if loading or model not found
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
          <div className="features-grid">
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

export default App;

