import Link from 'next/link';
import { fetchAllPolls } from '../services/api';
import { Poll } from '../types';

export default async function PollsPage() {
  let polls: Poll[] = [];
  let error: string | null = null;

  try {
    polls = await fetchAllPolls();
  } catch (e) {
    error = 'Failed to fetch polls. Please try again later.';
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">All Polls</h1>
      {error ? (
        <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      ) : (
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
      )}
    </div>
  );
}