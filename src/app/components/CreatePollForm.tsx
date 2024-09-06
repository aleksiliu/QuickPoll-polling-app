'use client';
import { useState, KeyboardEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '../services/api';
import Image from 'next/image';

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const trimmedQuestion = question.trim();
    const validOptions = options.filter(opt => opt.trim() !== '');
  
    if (trimmedQuestion === '') {
      setError('Please provide a question.');
      setIsLoading(false);
      return;
    }
  
    if (validOptions.length < 2) {
      setError('Please provide at least two non-empty options.');
      setIsLoading(false);
      return;
    }

    try {
      const poll = await createPoll(question, validOptions);
      const encodedQuestion = encodeURIComponent(poll.question.replace(/\s+/g, '-').toLowerCase());
      router.push(`/polls/${poll.id}/${encodedQuestion}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };


  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Tab' && !event.shiftKey && index === options.length - 1) {
      event.preventDefault();
      addOption();
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setHeaderImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="mb-4">
        <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700 mb-1">
          Header Image (optional)
        </label>
        <input
          type="file"
          id="headerImage"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        {headerImage ? (
          <div className="relative">
            <Image
              src={headerImage}
              alt="Poll header"
              width={400}
              height={200}
              className="w-full h-40 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <span className="text-gray-500">Click to upload an image</span>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Poll Question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your poll question"
          className="w-full p-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder={`Option ${index + 1}`}
            className="flex-grow p-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          />
          {options.length > 2 && (
        <button
        type="button"
        onClick={() => removeOption(index)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label={`Remove option ${index + 1}`}
      >
        X
      </button>
          )}
        </div>
      ))}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 10}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300"
        >
          Add Option
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300"
        >
          {isLoading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}