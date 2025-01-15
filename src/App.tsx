import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [numbers, setNumbers] = useState<string>('Tap button to scan ticket');
  const [isProcessing, setIsProcessing] = useState(false);

  const scanTicket = useCallback(async () => {
    try {
      setIsProcessing(true);
      const imageSrc = webcamRef.current?.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      const worker = await createWorker('eng');
      const result = await worker.recognize(imageSrc);
      await worker.terminate();

      // Find all numbers in the text
      const matches = result.data.text.match(/\b\d{1,2}\b/g) || [];
      const validNumbers = matches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 99)
        .sort((a, b) => a - b);

      setNumbers(
        validNumbers.length > 0
          ? `Numbers found: ${validNumbers.join(', ')}`
          : 'No valid numbers found'
      );
    } catch (error) {
      setNumbers('Error scanning ticket');
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
      </div>
    </div>
  );
}

export default App;