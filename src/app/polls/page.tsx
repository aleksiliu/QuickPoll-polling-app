import Link from 'next/link';
import { fetchAllPolls } from '../services/api';
import { Poll } from '../types';

export default async function PollsPage() {
  let polls: Poll[] = [];
  let error: string | null = null;

  try {
    polls = await fetchAllPolls();
    console.log(polls);

  } catch (e) {
    error = 'Failed to fetch polls. Please try again later.';
    console.error(e);
  }

  console.log(polls);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Polls</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li key={poll.id} className="border p-4 rounded-lg">
              <Link href={`/polls/${poll.id}/${encodeURIComponent(poll.question.replace(/\s+/g, '-').toLowerCase())}`} className="text-blue-500 hover:underline">
                {poll.question}
              </Link>
              <p className="text-sm text-gray-500 mt-2">Options: {poll.options.length}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}