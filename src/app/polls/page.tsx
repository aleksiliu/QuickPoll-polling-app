import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { Poll, Option } from '../types';
import { slugify } from '../utils/stringUtils';

async function fetchAllPolls(): Promise<Poll[]> {
  const polls = await prisma.poll.findMany({
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true }
          }
        }
      }
    },
  });

  return polls.map((poll): Poll => ({
    ...poll,
    options: poll.options.map(({ _count, ...option }): Option => ({
      ...option,
      voteCount: _count.votes,
      votes: [] 
    }))
  }));
}

export default async function PollsPage() {
  const polls = await fetchAllPolls();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Polls</h1>
        <Link 
          href="/" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Create New Poll
        </Link>
      </div>
      {polls.length > 0 ? (
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li key={poll.id} className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
              <Link 
                href={`/polls/${poll.id}/${slugify(poll.question)}`}
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
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-neutral-300 mb-4">
            No polls found. Why not create a new one?
          </p>   
        </div>
      )}
    </div>
  );
}