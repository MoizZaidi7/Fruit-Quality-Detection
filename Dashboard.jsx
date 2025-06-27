import React, { useState, useRef, useEffect } from "react";

export default function Dashboard() {
  const [results, setResults] = useState({
    predictions: [],
    originalImage: null,
    gradcamImage: null,
    shapImage: null,
    loading: false,
    error: null
  });

  const fileInputRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shapLoading, setShapLoading] = useState(false);
  const [apiUrl] = useState("https://a55c-35-196-1-250.ngrok-free.app"); // Replace with your ngrok URL
  const [userEmail, setUserEmail] = useState('');
  
  // Try to find the user email from various storage locations
  useEffect(() => {
    const checkStorageForEmail = () => {
      // Check common storage locations for email
      const possibleKeys = ['userEmail', 'email', 'user_email', 'user.email'];
      const storageTypes = [localStorage, sessionStorage];
      
      for (const storage of storageTypes) {
        for (const key of possibleKeys) {
          const value = storage.getItem(key);
          if (value) {
            setUserEmail(value);
            return;
          }
        }
      }
    };
    
    checkStorageForEmail();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setSelectedFiles(files);
    const originalImageUrl = URL.createObjectURL(files[0]);
    
    setResults({
      predictions: [],
      originalImage: originalImageUrl,
      gradcamImage: null,
      shapImage: null,
      loading: false,
      error: null
    });
  };

  const handlePrediction = async () => {
    if (!selectedFiles.length) {
      setResults(prev => ({ ...prev, error: "Please upload an image first" }));
      return;
    }
  
    setResults(prev => ({ ...prev, loading: true, error: null }));
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFiles[0]);

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();

      setResults(prev => ({
        ...prev,
        predictions: data.predictions || [],
        loading: false,
        error: null
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to analyze image"
      }));
    }
  };

  const handleGradCAM = async () => {
    if (!selectedFiles.length) {
      setResults(prev => ({ ...prev, error: "Please upload an image first" }));
      return;
    }
  
    setResults(prev => ({ ...prev, loading: true, error: null }));
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFiles[0]);
  
      const response = await fetch(`${apiUrl}/gradcam`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Grad-CAM failed');
      }
  
      const blob = await response.blob();
      const gradcamUrl = URL.createObjectURL(blob);
  
      setResults(prev => ({
        ...prev,
        gradcamImage: gradcamUrl,
        loading: false
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Grad-CAM failed" 
      }));
    }
  };
  
  const handleGenerateShap = async () => {
    if (!selectedFiles.length) {
      setResults(prev => ({ ...prev, error: "Please upload an image first" }));
      return;
    }
  
    setShapLoading(true);
    setResults(prev => ({ ...prev, error: null }));
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFiles[0]);
  
      const response = await fetch(`${apiUrl}/shap`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'SHAP generation failed');
      }
  
      const blob = await response.blob();
      const shapUrl = URL.createObjectURL(blob);
  
      setResults(prev => ({
        ...prev,
        shapImage: shapUrl,
        error: null
      }));
    } catch (error) {
      console.error('SHAP Error:', error);
      setResults(prev => ({ 
        ...prev, 
        error: error.message.includes('Failed to fetch') 
          ? "Network error - check your connection"
          : error.message
      }));
    } finally {
      setShapLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!userEmail) {
        // If we don't have the email, let's prompt the user for it
        const promptedEmail = prompt('Please enter your email address to logout:');
        
        if (!promptedEmail) {
          alert('Email is required to logout');
          return;
        }
        
        setUserEmail(promptedEmail);
        // Use the prompted email for logout
        await performLogout(promptedEmail);
      } else {
        // Use the email we already have
        await performLogout(userEmail);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };
  
  const performLogout = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        // Clear any stored user data
        const storageTypes = [localStorage, sessionStorage];
        const possibleKeys = ['userEmail', 'email', 'user_email', 'user.email', 'token', 'userName'];
        
        for (const storage of storageTypes) {
          for (const key of possibleKeys) {
            storage.removeItem(key);
          }
        }
        
        // Redirect to login page
        window.location.href = '/login';
      } else {
        const data = await response.json();
        alert(`Logout failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed w-full top-0 bg-gray-900 text-white shadow-lg z-10">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Fruit Quality Classifier</h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto pt-24 pb-8 px-4">
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Upload Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 mb-4"
          />
          
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {selectedFiles.length} image(s) selected
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button
              onClick={handlePrediction}
              disabled={!selectedFiles.length || results.loading}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {results.loading ? 'Processing...' : 'Run Classification'}
            </button>
            
            <button
              onClick={handleGradCAM}
              disabled={!selectedFiles.length || results.loading}
              className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
            >
              Generate GradCAM
            </button>
            
            <button
              onClick={handleGenerateShap}
              disabled={!selectedFiles.length || shapLoading}
              className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {shapLoading ? 'Generating SHAP...' : 'Generate SHAP'}
            </button>
          </div>
          
          {results.error && (
            <div className="mt-4 p-2 bg-red-50 text-red-800 rounded">
              {results.error}
            </div>
          )}
        </div>

        {results.predictions.length > 0 && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Detection Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.predictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg capitalize">
                    {prediction.predicted_class}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Quality: {prediction.quality} ({prediction.quality_confidence}%)
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Confidence: {prediction.confidence}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {results.originalImage && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <h3 className="text-lg font-semibold p-2 bg-gray-50 border-b">Original Image</h3>
              <div className="p-4">
                <img 
                  src={results.originalImage} 
                  alt="Original" 
                  className="w-full h-auto rounded"
                  onLoad={() => URL.revokeObjectURL(results.originalImage)}
                />
              </div>
            </div>
          )}

          {results.gradcamImage && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <h3 className="text-lg font-semibold p-2 bg-gray-50 border-b">Grad-CAM Heatmap</h3>
              <div className="p-4">
                <img 
                  src={results.gradcamImage} 
                  alt="Grad-CAM" 
                  className="w-full h-auto rounded"
                  onLoad={() => URL.revokeObjectURL(results.gradcamImage)}
                />
              </div>
            </div>
          )}
        </div>

        {results.shapImage && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <h3 className="text-lg font-semibold p-2 bg-gray-50 border-b">SHAP Explanation</h3>
            <div className="p-4">
              <img 
                src={results.shapImage} 
                alt="SHAP Explanation" 
                className="w-full h-auto rounded"
                onLoad={() => URL.revokeObjectURL(results.shapImage)}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>Fruit Quality Classification System</p>
        </div>
      </footer>
    </div>
  );
}