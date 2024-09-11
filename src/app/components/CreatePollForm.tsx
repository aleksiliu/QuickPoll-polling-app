'use client';
import { useState, KeyboardEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '../services/api';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import { slugify } from '../utils/stringUtils';

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
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
      const poll = await createPoll(trimmedQuestion, validOptions, allowMultipleAnswers);
      const slugifiedQuestion = slugify(poll.question);
  
      if (headerImage) {
        localStorage.setItem(`pollImage_${poll.id}`, headerImage);
      }
  
      router.push(`/polls/${poll.id}/${slugifiedQuestion}`);
    } catch (error) {
    
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
        try {
            localStorage.clear(); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeaderImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error('Error reading file:', e);
        }
    }
  };


  const removeImage = () => {
    setHeaderImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto">
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
              className="w-full h-40 object-cover rounded-md object-center"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
        <label htmlFor="question" className="block text-lg font-medium text-gray-700 mb-2">
          Poll Question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 text-lg border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">Poll Options</label>
        {options.map((option, index) => (
          <div key={index} className="space-y-1">
            <label htmlFor={`option-${index}`} className="block text-base font-medium text-gray-700">
              Option {index + 1}
            </label>
            <div className="flex items-center space-x-2">
              <input
                id={`option-${index}`}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="flex-grow p-3 text-lg border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                required
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
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="allowMultipleAnswers"
          checked={allowMultipleAnswers}
          onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
          className="form-checkbox text-blue-600"
        />
        <label htmlFor="allowMultipleAnswers" className="text-sm text-gray-700">
          Allow multiple answers (voters can select more than one option)
        </label>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 10}
          className="bg-white text-gray-700 border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
        >
          Add Option
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 flex items-center justify-center"
        >
        {isLoading ? <LoadingSpinner /> : 'Create Poll'}
        </button>

      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}