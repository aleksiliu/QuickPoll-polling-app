'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '../lib/api';

function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const poll = await createPoll(question, options.filter(opt => opt.trim() !== ''));
      const encodedQuestion = encodeURIComponent(poll.question.replace(/\s+/g, '-').toLowerCase());
      router.push(`/polls/${poll.id}/${encodedQuestion}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your poll name"
        className="w-full p-2 border rounded text-black"
      />
      {options.map((option, index) => (
        <input
          key={index}
          type="text"
          value={option}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[index] = e.target.value;
            setOptions(newOptions);
          }}
          placeholder={`Option ${index + 1}`}
          className="w-full p-2 border rounded text-black"
        />
      ))}
      <button
        type="button"
        onClick={() => setOptions([...options, ''])}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Option
      </button>
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Create Poll
      </button>
    </form>
  );
}