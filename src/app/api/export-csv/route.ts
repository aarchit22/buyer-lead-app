import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse search params similar to the list page
    const search = searchParams.get('search') || undefined;
    const city = searchParams.get('city') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const status = searchParams.get('status') || undefined;
    const timeline = searchParams.get('timeline') || undefined;

    // Build where clause (similar to buildWhere function in buyers page)
    const where: any = {};
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

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        bhk: true,
        purpose: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        source: true,
        notes: true,
        tags: true,
        status: true,
      },
    });

    // CSV headers matching the import format from task.md
    const headers = [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
      'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 
      'notes', 'tags', 'status'
    ];

    // Convert buyers to CSV rows
    const csvRows = buyers.map(buyer => {
      return headers.map(header => {
        const value = buyer[header as keyof typeof buyer];
        if (header === 'tags') {
          return Array.isArray(value) ? value.join(';') : '';
        }
        return value || '';
      });
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=buyers-export-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('CSV export failed:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
