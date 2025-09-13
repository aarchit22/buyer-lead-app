import { requireUser } from '@/lib/auth';
import { BuyerCreateForm } from './buyer-create-form';

export default async function NewBuyerPage() {
  await requireUser();
  return (
    <div className="page-container">
      <div className="panel">
        <h1 className="panel-title">Create New Buyer Lead</h1>
        <BuyerCreateForm />
      </div>
    </div>
  );
}

