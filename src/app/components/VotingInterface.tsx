'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchPoll, submitVote } from '../services/api';
import { Poll, Option } from '../types';

export default function VotingInterface({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const loadPoll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPoll(pollId);
      setPoll(data);
      setError(null);
    } catch (error) {
      setError('Failed to load poll');
      setPoll(null);
    } finally {
      setIsLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    loadPoll();
  }, [loadPoll]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      await submitVote(pollId, selectedOption);
      setHasVoted(true);
      setPoll((currentPoll) => {
        if (!currentPoll) return null;
        return {
          ...currentPoll,
          options: currentPoll.options.map((option) => 
            option.id === selectedOption
              ? { ...option, voteCount: option.voteCount + 1 }
              : option
          ),
        };
      });
      setSelectedOption(null);
    } catch (error) {
      setError('Failed to submit vote');
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!poll || !poll.options) return <div className="text-center p-4">No poll data available</div>;

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">{poll.question}</h2>
      {poll.options.map((option: Option) => (
        <div key={option.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded transition-colors">
          <input
            type="radio"
            id={`option-${option.id}`}
            name="poll-option"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => setSelectedOption(option.id)}
            disabled={hasVoted}
            className="form-radio text-blue-600"
          />
          <label htmlFor={`option-${option.id}`} className="text-gray-700 flex-grow">
            {option.text} <span className="font-semibold ml-1">({option.voteCount} votes)</span>
          </label>
        </div>
      ))}
      <div className="flex space-x-2">
        <button
          onClick={handleVote}
          disabled={!selectedOption || hasVoted}
          className="flex-grow bg-blue-500 text-white p-2 rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
        >
          {hasVoted ? 'Voted' : 'Vote'}
        </button>
        {hasVoted && (
          <button
            onClick={loadPoll}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          >
            Refresh Results
          </button>
        )}
      </div>
    </div>
  );
}