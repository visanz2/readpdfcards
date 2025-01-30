import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload } from 'lucide-react';

const CardProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');

  const processText = (text) => {
    // Split text into cards based on blank lines
    const sections = text.split(/\n\s*\n/);
    
    return sections.map(section => {
      // Find the first line that ends with a period - that's likely the title
      const lines = section.split('\n');
      let titleIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
          titleIndex = i;
          break;
        }
      }
      
      const title = lines[titleIndex] || 'Untitled';
      const description = lines.slice(titleIndex + 1).join('\n').trim();
      
      return {
        title,
        description
      };
    }).filter(card => card.title && card.description);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const worker = await createWorker();
      await worker.loadLanguage('spa');
      await worker.initialize('spa');
      
      const { data: { text } } = await worker.recognize(file);
      const processedCards = processText(text);
      setCards(processedCards);
      
      await worker.terminate();
    } catch (err) {
      setError('Error processing the PDF. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Board Game Card Processor</h1>
        
        <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 mb-2 text-gray-600" />
          <span className="text-sm text-gray-600">Upload PDF</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>

        {isProcessing && (
          <div className="mt-4">
            <p className="text-gray-600">Processing PDF, please wait...</p>
          </div>
        )}

        {error && (
          <Alert className="mt-4 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{card.title}</h2>
              <p className="text-gray-600 whitespace-pre-line">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardProcessor;