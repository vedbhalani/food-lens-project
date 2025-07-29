import React, { useState, useRef } from 'react';
import './App.css'; // We will create this file for styling

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null); // Reset previous analysis
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image first!');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('https://food-lens-api.onrender.com/analyze-food',  {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // The analysis from the backend is a string, so we parse it into a JSON object
      const parsedAnalysis = JSON.parse(data.analysis);
      setAnalysis(parsedAnalysis);

    } catch (e) {
      console.error("There was an error uploading the file", e);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>FoodLens AI 🍕</h1>
        <p>Upload a picture of your food and let AI analyze it!</p>
      </header>

      <main>
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button onClick={() => fileInputRef.current.click()} className="btn-choose">
            Choose Image
          </button>
          <button onClick={handleUpload} className="btn-analyze" disabled={isLoading || !image}>
            {isLoading ? 'Analyzing...' : 'Analyze Food'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="content-area">
          {preview && !analysis && (
            <div className="image-preview">
              <h2>Preview</h2>
              <img src={preview} alt="Food preview" />
            </div>
          )}

          {isLoading && <div className="loader"></div>}

          {analysis && (
            <div className="results-container">
                <div className="results-image">
                    <img src={preview} alt="Analyzed food" />
                </div>
                <div className="results-details">
                    <h2>Analysis Results</h2>
                    <h3>{analysis.food_name || "N/A"}</h3>
                    <p>{analysis.description || "No description available."}</p>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Type:</strong> {analysis.is_veg ? "Vegetarian 🥬" : "Non-Vegetarian 🍗"}
                        </div>
                        <div className="info-item">
                            <strong>Calories:</strong> {analysis.calories_estimation || "N/A"}
                        </div>
                        <div className="info-item">
                            <strong>Quality:</strong> {analysis.quality_score}/10 ✨
                        </div>
                        <div className="info-item">
                            <strong>Protein:</strong> {analysis.macronutrients?.protein || "N/A"}
                        </div>
                        <div className="info-item">
                            <strong>Carbs:</strong> {analysis.macronutrients?.carbs || "N/A"}
                        </div>
                        <div className="info-item">
                            <strong>Fat:</strong> {analysis.macronutrients?.fat || "N/A"}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;