import { requireUser } from '@/lib/auth';
import { BuyerCreateForm } from './buyer-create-form';
import Link from 'next/link';
import LogoutButton from '@/components/logout-button';

export default async function NewBuyerPage() {
  await requireUser();
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create New Buyer Lead</h1>
        <div className="flex gap-2">
          <Link href="/buyers" className="btn btn-outline">Back to list</Link>
          <LogoutButton />
        </div>
      </div>
      <div className="panel">
        <BuyerCreateForm />
      </div>
    </div>
  );
}

