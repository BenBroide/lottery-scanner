import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [numbers, setNumbers] = useState<string>('Tap button to scan ticket');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoConstraints = {
    facingMode: { exact: "environment" }  // This specifies the back camera
  };

  const scanTicket = useCallback(async () => {
    try {
      setIsProcessing(true);
      setDebugInfo([]); // Clear previous debug info
      
      // Step 1: Capture image
      setDebugInfo(prev => [...prev, '1. Capturing image...']);
      const imageSrc = webcamRef.current?.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }
      setDebugInfo(prev => [...prev, '✓ Image captured successfully']);

      // Step 2: Initialize Tesseract
      setDebugInfo(prev => [...prev, '2. Initializing Tesseract...']);
      const worker = await createWorker('eng');
      setDebugInfo(prev => [...prev, '✓ Tesseract initialized']);

      // Step 3: Perform OCR
      setDebugInfo(prev => [...prev, '3. Performing text recognition...']);
      const result = await worker.recognize(imageSrc);
      await worker.terminate();
      setDebugInfo(prev => [...prev, '✓ Text recognition completed']);
      setDebugInfo(prev => [...prev, '\nFull text found:\n' + result.data.text]);

      // Step 4: Process text
      setDebugInfo(prev => [...prev, '\n4. Processing text line by line...']);
      const lines = result.data.text.split('\n');
      setDebugInfo(prev => [...prev, `Found ${lines.length} lines of text`]);

      // Step 5: Search for numbers
      let numbersFound = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        setDebugInfo(prev => [...prev, `\nChecking line ${i + 1}: "${line}"`]);
        
        // Match exactly 5 groups of 2 digits
        const match = line.match(/\b(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\b/);
        if (match) {
          setDebugInfo(prev => [...prev, `✓ Found matching numbers: ${match[0]}`]);
          setNumbers(`Numbers found: ${match[0]}`);
          numbersFound = true;
          break;
        } else {
          setDebugInfo(prev => [...prev, '✗ No matching numbers in this line']);
        }
      }
      
      if (!numbersFound) {
        setNumbers('No valid lottery numbers found. Please try again.');
        setDebugInfo(prev => [...prev, '\n✗ No valid lottery numbers found in any line']);
      }

    } catch (error: unknown) {
      setNumbers('Error scanning ticket');
      if (error instanceof Error) {
        setDebugInfo(prev => [...prev, `\nError: ${error.message}`]);
      } else {
        setDebugInfo(prev => [...prev, '\nAn unknown error occurred']);
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Lottery Scanner</h1>
        
        <div className="relative mb-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
            videoConstraints={videoConstraints}
          />
        </div>

        <button
          onClick={scanTicket}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
            isProcessing
              ? 'bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Scan Ticket'}
        </button>

        <p className="mt-4 text-center text-lg">{numbers}</p>

        {/* Debug Information */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">Debug Information:</h2>
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {debugInfo.join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;