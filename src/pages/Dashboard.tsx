import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link to="/prompts" className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-xl font-semibold">My Prompts</h2>
          <p className="text-gray-600">Manage your prompt library</p>
        </Link>
        <Link to="/prompts/new" className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-xl font-semibold">Create Prompt</h2>
          <p className="text-gray-600">Start a new prompt from scratch</p>
        </Link>
        <Link to="/optimizer" className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-xl font-semibold">AI Optimizer</h2>
          <p className="text-gray-600">Improve your prompts with AI</p>
        </Link>
      </div>
    </div>
  );
}
