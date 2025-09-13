import { PrismaClient, City, PropertyType, Status, Timeline } from '@prisma/client';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireUser, getSessionUser } from '@/lib/auth';
import SearchFilters from './search-filters';
import CSVExportButton from './csv-export-button';
import CSVImportButton from './csv-import-button';
import EmptyState from '@/components/empty-state';
import LogoutButton from '@/components/logout-button';

// NOTE: In a larger app, move prisma singleton to a shared module
const prisma = new PrismaClient();

// Page size constant
const PAGE_SIZE = 10;

type SearchParams = {
  page?: string;
  search?: string;
  city?: City;
  propertyType?: PropertyType;
  status?: Status;
  timeline?: Timeline;
};

function buildWhere(params: SearchParams) {
  const { search, city, propertyType, status, timeline } = params;
  const where: Record<string, unknown> = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  return where;
}

async function BuyersTable({ params }: { params: SearchParams }) {
  const page = Math.max(parseInt(params.page || '1', 10), 1);
  const where = buildWhere(params);

  const [total, buyers] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        phone: true,
        city: true,
        propertyType: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (buyers.length === 0) {
    return (
      <EmptyState
        title="No buyers found"
        description={Object.keys(buildWhere(params)).length > 0 
          ? "No buyers match your current filters. Try adjusting your search criteria."
          : "You haven't created any buyer leads yet. Get started by adding your first lead."}
        icon="👥"
        action={{
          label: "Create New Lead",
          href: "/buyers/new"
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto panel">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map(b => (
              <tr key={b.id} className="align-top">
                <td className="font-medium">{b.fullName}</td>
                <td>{b.phone}</td>
                <td>{b.city}</td>
                <td>{b.propertyType}</td>
                <td>{b.budgetMin || '-'}{b.budgetMax ? ` - ${b.budgetMax}` : ''}</td>
                <td>{b.timeline}</td>
                <td>{b.status}</td>
                <td>{new Date(b.updatedAt).toLocaleString()}</td>
                <td><Link href={`/buyers/${b.id}`} className="btn btn-ghost px-1 py-0 text-xs">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} params={params} />
    </div>
  );
}

function Pagination({ page, totalPages, params }: { page: number; totalPages: number; params: SearchParams }) {
  const makeLink = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k,v]) => { if (v && k !== 'page') sp.set(k,v as string); });
    sp.set('page', String(p));
    return `/buyers?${sp.toString()}`;
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <div>Page {page} of {totalPages}</div>
      <div className="space-x-2">
        <Link aria-disabled={page===1} className={`px-2 py-1 border rounded ${page===1? 'pointer-events-none opacity-40':''}`} href={makeLink(page-1)}>Prev</Link>
        <Link aria-disabled={page===totalPages} className={`px-2 py-1 border rounded ${page===totalPages? 'pointer-events-none opacity-40':''}`} href={makeLink(page+1)}>Next</Link>
      </div>
    </div>
  );
}

// Search & Filters (client component for debounced input & URL sync)

export default async function BuyersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const isAdmin = user.username === 'admin';
  
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buyer Leads</h1>
          <p className="text-sm text-muted mt-1">
            Logged in as: <span className="font-medium">{user.username}</span>
            {isAdmin && <span className="ml-2 text-xs bg-accent text-accent-fg px-2 py-1 rounded">ADMIN</span>}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/buyers/new" className="btn btn-outline">New Lead</Link>
          <CSVImportButton />
          <CSVExportButton />
          <LogoutButton />
        </div>
      </div>
      <SearchFilters 
        initialSearch={resolvedSearchParams.search}
        initialCity={resolvedSearchParams.city}
        initialPropertyType={resolvedSearchParams.propertyType}
        initialStatus={resolvedSearchParams.status}
        initialTimeline={resolvedSearchParams.timeline}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <BuyersTable params={resolvedSearchParams} />
      </Suspense>
    </main>
  );
}
