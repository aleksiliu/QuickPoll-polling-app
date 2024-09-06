'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAllPolls } from '../services/api';
import { Poll } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolls() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPolls = await fetchAllPolls();
        setPolls(fetchedPolls);
      } catch (err) {
        console.error('Failed to fetch polls:', err);
        setError('Failed to load polls. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPolls();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">All Polls</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">All Polls</h1>
        <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">All Polls</h1>
      <ul className="space-y-4">
        {polls.map((poll) => (
          <li key={poll.id} className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
            <Link 
              href={`/polls/${poll.id}/${encodeURIComponent(poll.question.replace(/\s+/g, '-').toLowerCase())}`}
              className="block p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-300">
                {poll.question}
              </h2>
              <p className="text-sm text-gray-600">
                {poll.options.length} option{poll.options.length !== 1 ? 's' : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}