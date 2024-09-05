'use client';

import { useState, useEffect } from 'react';
import { fetchPoll, submitVote } from '../lib/api';
import { Poll, Option } from '../types';  

export default function VotingInterface({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const data = await fetchPoll(pollId);
        setPoll(data);
      } catch (error) {
        setError('Failed to load poll');
      } finally {
        setIsLoading(false);
      }
    }
    loadPoll();
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      await submitVote(pollId, selectedOption);
     
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!poll || !poll.options) return <div>No poll data available</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{poll.question}</h2>
      {poll.options.map((option: Option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`option-${option.id}`}
            name="poll-option"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => setSelectedOption(option.id)}
            className="form-radio"
          />
          <label htmlFor={`option-${option.id}`}>{option.text} ({option.voteCount} votes)</label>
        </div>
      ))}
      <button
        onClick={handleVote}
        disabled={!selectedOption}
        className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
      >
        Vote
      </button>
    </div>
  );
}