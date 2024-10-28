import React, { useState } from 'react';

const PDFUploader = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file
  const [uploading, setUploading] = useState(false); // Track upload status
  const [question, setQuestion] = useState(''); // Store user question
  const [responses, setResponses] = useState([]); // Array to store question-answer pairs
  const [error, setError] = useState(''); // Track and display any errors

  // Handler for file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Check if file is a PDF
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(''); // Clear error if valid file is selected
    } else {
      setError('Please upload a PDF file.'); // Set error if invalid file
    }
  };

  // Handler for uploading PDF to the backend server
  const handleUpload = async () => {
    if (!selectedFile) return; // Return if no file selected
    setUploading(true);
    setError(''); 
    try {
      const formData = new FormData();
      formData.append('file', selectedFile); // Append file to form data

      // Send POST request to upload the file
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData,
      });

      // Check if upload was successful
      if (response.ok) {
        const result = await response.json();
        console.log('Uploaded file:', result.filename); // Log the uploaded filename
      } else {
        throw new Error('Upload failed'); // Throw error if upload fails
      }
    } catch (err) {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  // Handler for submitting a question
  const handleQuestionSubmit = async () => {
    if (!question) return; // Return if question is empty
    setUploading(true);
    try {
      // Send POST request with question to get the answer from backend
      const response = await fetch("http://localhost:8000/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      // Check if response was successful
      if (response.ok) {
        const result = await response.json();
        // Add new question-answer pair to responses array
        setResponses((prev) => [{ question, answer: result.answer }, ...prev]);
        setQuestion(''); // Clear question input after submission
      } else {
        throw new Error("Failed to get answer");
      }
    } catch (err) {
      setError('Error processing your question.');
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col h-screen">
        {/* Title for the application */}
        <h2 className="text-2xl text-amber-400 font-semibold mb-4">(PDF)Reader</h2>
        
        {/* File upload section */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {/* File input hidden behind label */}
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload"
          />
          <label 
            htmlFor="file-upload"
            className="cursor-pointer bg-green-300 text-white py-2 px-4 rounded-lg"
            style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
          >
            Select PDF
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading} // Disable if no file selected or uploading
            className="bg-green-300 text-white py-2 px-4 rounded-lg disabled:opacity-50"
            style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Error display */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Responses Section */}
        <div className="flex-grow overflow-y-auto bg-white p-4 mb-4 rounded-lg border">
          {responses.length > 0 ? (
            // Map through responses and display each question-answer pair
            responses.map((response, index) => (
              <div key={index} className="p-3 mb-2 bg-green-100 rounded">
                <h3 className="font-bold">Question:</h3>
                <p>{response.question}</p>
                <h3 className="font-bold mt-2">Answer:</h3>
                <p>{response.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No responses yet.</p> // Message if no responses available
          )}
        </div>

        {/* Question input and submission section */}
        {selectedFile && (
          <div className="my-6">
            <h3 className="font-bold mb-2">Ask a Question:</h3>
            <textarea
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)} // Update question state on change
              className="block w-full p-2 border rounded mb-4 resize-none h-24"
            />
            <button
              onClick={handleQuestionSubmit}
              disabled={uploading} // Disable button while uploading
              className="w-full bg-green-400 text-white py-2 px-4 rounded-lg"
            >
              {uploading ? 'Processing...' : 'Get Answer'}
            </button>
          </div>
        )}
    </div>
  );
};

export default PDFUploader;
