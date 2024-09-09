'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPoll, submitVote } from '../services/api';
import { Poll, Option } from '../types';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import { VotingOption } from './VotingOption';

export default function VotingInterface({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (poll) {
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    }
  }, [poll]);

  const loadPoll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPoll(pollId);
      setPoll(data);
      setAllowMultipleAnswers(data.allowMultipleAnswers);
      setError(null);
    } catch (error) {
      setError('Failed to load poll');
      setPoll(null);
    } finally {
      setIsLoading(false);
    }
  }, [pollId]);

  const sortedOptions = useMemo(() => {
    if (!poll) return [];
    return [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
  }, [poll]);

  const winningOption = useMemo(() => {
    if (sortedOptions.length === 0) return null;
    const maxVotes = sortedOptions[0].voteCount;
    const topOptions = sortedOptions.filter(option => option.voteCount === maxVotes);
    return topOptions.length === 1 ? topOptions[0] : null;
  }, [sortedOptions]);

  useEffect(() => {
    loadPoll();
    const storedImage = localStorage.getItem(`pollImage_${pollId}`);
    if (storedImage) {
      setHeaderImage(storedImage);
    }
  }, [loadPoll, pollId]);

  const handleOptionChange = (optionId: number) => {
    if (allowMultipleAnswers) {
      setSelectedOptions(prev => {
        const newSelection = prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId];
        return newSelection;
      });
    } else {
      setSelectedOptions([optionId]);
    }
  };

 const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000); 
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) return;
    try {
      for (const optionId of selectedOptions) {
        await submitVote(pollId, optionId, voterName || null);
      }
      setHasVoted(true);
      setPoll((currentPoll) => {
        if (!currentPoll) return null;
        return {
          ...currentPoll,
          options: currentPoll.options.map((option) => 
            selectedOptions.includes(option.id)
              ? { 
                  ...option, 
                  voteCount: option.voteCount + 1, 
                  votes: [...option.votes, { id: Date.now(), voterName: voterName || 'Anonymous' }] 
                }
              : option
          ),
        };
      });
      setSelectedOptions([]);
      setVoterName('');
    } catch (error) {
      setError('Failed to submit vote');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!poll || !poll.options) return <div className="text-center p-4">No poll data available</div>;

  const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      {headerImage && (
        <div className="mb-4">
          <Image
            src={headerImage}
            alt="Poll header"
            width={400}
            height={200}
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{poll.question}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {allowMultipleAnswers ? "You can select multiple options" : "Select one option"}
      </p>
   
      {sortedOptions.map((option: Option) => (
       <VotingOption
       key={option.id}
       option={option}
       hasVoted={hasVoted}
       isWinning={winningOption?.id === option.id}
       isSelected={selectedOptions.includes(option.id)}
       totalVotes={totalVotes}
       animate={animate}
       allowMultipleAnswers={allowMultipleAnswers}
       onOptionChange={handleOptionChange}
     />
      ))}
      {!hasVoted && (
        <>
          <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="voterName"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your name"
          />
        </>
      )}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleVote}
          disabled={selectedOptions.length === 0 || hasVoted}
          className="flex-grow bg-blue-500 text-white p-2 rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
        >
          {hasVoted ? 'Voted' : 'Vote'}
        </button>
            <div className="relative">
    <button
      onClick={copyToClipboard}
      className="bg-white text-gray-700 p-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      Share
    </button>
    {showTooltip && (
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg transition-opacity duration-300">
        Link added to clipboard!
      </div>
    )}
  </div>
      </div>
      <p className="mt-2 text-center text-gray-600">Total votes: {totalVotes}</p>
    </div>
  );
}