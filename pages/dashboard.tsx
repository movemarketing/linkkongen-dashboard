import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);

  const loadCredits = async () => {
    const res = await fetch('/api/user');
    const data = await res.json();
    setCredits(data.credits);
  };

  const useCredit = async () => {
    await fetch('/api/use-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session?.user?.email, amount: 1 }),
    });
    loadCredits();
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Velkommen, {session?.user?.email}</p>
      <p>Credits: {credits ?? '...'}</p>
      <button onClick={useCredit}>Brug 1 credit</button>
      <button onClick={loadCredits}>Opdater</button>
    </div>
  );
}