import CreatePollForm from './components/CreatePollForm';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-center font-bold mb-8">Create a New Poll</h1>
      <CreatePollForm />
    </div>
  );
}