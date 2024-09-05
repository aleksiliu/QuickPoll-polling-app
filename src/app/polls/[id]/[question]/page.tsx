import VotingInterface from '@/app/components/VotingInterface';

export default function PollPage({ params }: { params: { id: string, question: string } }) {
  const decodedQuestion = decodeURIComponent(params.question).replace(/-/g, ' ');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 capitalize">{decodedQuestion}</h1>
      <VotingInterface pollId={params.id} />
    </div>
  );
}