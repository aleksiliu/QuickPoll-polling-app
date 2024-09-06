'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '../services/api';

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700">
          Poll Question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your poll question"
          className="mt-1 block w-full p-2 border rounded text-black"
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
            placeholder={`Option ${index + 1}`}
            className="flex-grow p-2 border rounded text-black"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="bg-red-500 text-white p-2 rounded"
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
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          Add Option
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}