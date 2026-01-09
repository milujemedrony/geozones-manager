import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const geozones = await prisma.geozone.findMany({
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: geozones,
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to list geozones' },
      { status: 500 }
    );
  }
}
