import React from 'react';
import { Option } from '../types';

interface VotingOptionProps {
  option: Option;
  hasVoted: boolean;
  isWinning: boolean;
  isSelected: boolean;
  totalVotes: number;
  animate: boolean;
  allowMultipleAnswers: boolean;
  onOptionChange: (optionId: number) => void;
}

export function VotingOption({
  option,
  hasVoted,
  isWinning,
  isSelected,
  totalVotes,
  animate,
  allowMultipleAnswers,
  onOptionChange
}: VotingOptionProps) {
  return (
    <div key={option.id} className="mb-2">
      <div className="flex items-center space-x-2 py-2 hover:bg-gray-100 rounded transition-colors">
        {!hasVoted && (
          <input
            type={allowMultipleAnswers ? "checkbox" : "radio"}
            id={`option-${option.id}`}
            name="poll-option"
            value={option.id}
            checked={isSelected}
            onChange={() => onOptionChange(option.id)}
            className={`flex-shrink-0 ${allowMultipleAnswers ? "form-checkbox text-blue-600" : "form-radio text-blue-600"}`}
          />
        )}
        <label htmlFor={`option-${option.id}`} className="text-gray-700 flex-grow flex items-center break-words overflow-wrap-anywhere pr-2">
          <span>{option.text}</span>
          {hasVoted && isWinning && totalVotes >= 3 && (
            <span className="ml-2 px-2 py-1 text-xs font-bold rounded bg-green-200 text-green-800">
              MOST VOTES
            </span>
          )}
        </label>
        <div className="flex flex-col items-end ml-2">
          <span className="font-semibold text-gray-600 text-sm">
            {option.voteCount} votes
          </span>
          <span className="text-gray-500 text-xs">
            ({totalVotes > 0 ? ((option.voteCount / totalVotes) * 100).toFixed(1) : 0}%)
          </span>
        </div>
      </div>
      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 ease-out"
          style={{ 
            width: animate ? `${(option.voteCount / totalVotes) * 100}%` : '0%'
          }}
        ></div>
      </div>
      {option.votes && option.votes.length > 0 && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">Voters: {option.votes.map(vote => vote.voterName).join(', ')}</p>
        </div>
      )}
    </div>
  );
}