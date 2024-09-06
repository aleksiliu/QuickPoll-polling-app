import { notFound } from 'next/navigation';
import VotingInterface from '@/app/components/VotingInterface';
import { prisma } from '../../../lib/prisma';
import { slugify } from '../../../utils/stringUtils';

async function getPoll(id: string) {
  const pollId = parseInt(id);
  if (isNaN(pollId)) {
    return null;
  }
  return await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });
}

export default async function PollPage({ params }: { params: { id: string, question: string } }) {
  const poll = await getPoll(params.id);

  if (!poll || slugify(poll.question) !== params.question) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <VotingInterface pollId={params.id} />
    </div>
  );
}