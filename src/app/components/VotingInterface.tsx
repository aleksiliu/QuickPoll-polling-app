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

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/poll/${pollId}`);
        if (response.ok) {
          const data = await response.json();
          setPoll(data);
        } else {
          console.error('Failed to fetch poll');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchPoll();
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      const response = await fetch(`/api/poll/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });
      if (response.ok) {
        // Refresh poll data after voting
        const updatedPoll = await response.json();
        setPoll(updatedPoll);
      } else {
        console.error('Failed to submit vote');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!poll) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
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