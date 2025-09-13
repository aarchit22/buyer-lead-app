import { PrismaClient } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BuyerEditForm from './buyer-edit-form'; // ensure .tsx resolves

const prisma = new PrismaClient();

async function fetchBuyer(id: string) {
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return null;
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: 'desc' },
    take: 5,
  });
  return { buyer, history };
}

function formatBudget(min: number | null | undefined, max: number | null | undefined) {
  if (!min && !max) return '-';
  if (min && !max) return `${min}`;
  if (!min && max) return `${max}`;
  return `${min} - ${max}`;
}


export default async function BuyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const resolvedParams = await params;
  const data = await fetchBuyer(resolvedParams.id);
  if (!data) return notFound();

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Buyer</h1>
        <Link href="/buyers" className="btn btn-outline">Back to list</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2 panel space-y-6">
          {/* Client form mount */}
          <BuyerEditForm initial={data} />
        </section>
        <aside className="space-y-4">
          <div className="panel">
            <h2 className="font-semibold mb-3 text-sm tracking-wide text-muted">Meta</h2>
            <dl className="text-sm space-y-1">
              <div><dt className="font-medium inline">ID:</dt> <dd className="inline break-all">{data.buyer.id}</dd></div>
              <div><dt className="font-medium inline">Owner:</dt> <dd className="inline">{data.buyer.ownerId}</dd></div>
              <div><dt className="font-medium inline">Updated:</dt> <dd className="inline">{new Date(data.buyer.updatedAt).toLocaleString()}</dd></div>
              <div><dt className="font-medium inline">Budget:</dt> <dd className="inline">{formatBudget(data.buyer.budgetMin, data.buyer.budgetMax)}</dd></div>
            </dl>
          </div>
          <div className="panel">
            <h2 className="font-semibold mb-3 text-sm tracking-wide text-muted">Recent Changes</h2>
            {data.history.length === 0 ? (
              <p className="text-muted text-sm">No history yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-compact">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 font-medium text-muted">Field</th>
                      <th className="py-2 font-medium text-muted">Old Value</th>
                      <th className="py-2 font-medium text-muted">New Value</th>
                      <th className="py-2 font-medium text-muted">Updated When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.flatMap((h: any) => {
                      const changes = h.diff;
                      if (changes.initial_creation) {
                        return [
                          <tr key={`${h.id}-creation`} className="border-b">
                            <td className="py-2 font-medium">Initial Creation</td>
                            <td className="py-2 text-muted">-</td>
                            <td className="py-2 text-muted">Record created</td>
                            <td className="py-2">{new Date(h.changedAt).toLocaleString()}</td>
                          </tr>
                        ];
                      }
                      
                      return Object.entries(changes).map(([field, change]: [string, any]) => (
                        <tr key={`${h.id}-${field}`} className="border-b">
                          <td className="py-2 font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="py-2 text-muted max-w-32 truncate" title={JSON.stringify(change.from)}>
                            {Array.isArray(change.from) ? `[${change.from.join(', ')}]` : String(change.from || '-')}
                          </td>
                          <td className="py-2 max-w-32 truncate" title={JSON.stringify(change.to)}>
                            {Array.isArray(change.to) ? `[${change.to.join(', ')}]` : String(change.to || '-')}
                          </td>
                          <td className="py-2">{new Date(h.changedAt).toLocaleString()}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
