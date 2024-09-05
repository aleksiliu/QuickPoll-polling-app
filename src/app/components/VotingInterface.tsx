'use client';

import { useState, useEffect } from 'react';

interface Option {
  id: number;
  text: string;
  voteCount: number;
}

interface Poll {
  id: number;
  question: string;
  options: Option[];
}

export default function VotingInterface({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/poll/${pollId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.options)) {
            setPoll(data);
          } else {
            setError('Invalid poll data structure');
          }
        } else {
          setError('Failed to fetch poll');
        }
      } catch (error) {
        setError('Error fetching poll');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;
    try {
      const response = await fetch(`/api/poll/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });
      if (response.ok) {
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
      } else {
        setError('Failed to submit vote');
      }
    } catch (error) {
      setError('Error submitting vote');
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!poll || !poll.options) return <div>No poll data available</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{poll.question}</h2>
      {poll.options.map((option) => (
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