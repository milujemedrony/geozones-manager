import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

const GEOZONES_DIR = path.join(process.cwd(), 'public', 'geozones');

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string; version: string } }
) {
  try {
    const { name, version } = params;
    const versionNum = parseInt(version, 10);

    if (isNaN(versionNum)) {
      return NextResponse.json(
        { error: 'Invalid version number' },
        { status: 400 }
      );
    }

    const geozone = await prisma.geozone.findUnique({
      where: {
        name_version: {
          name,
          version: versionNum,
        },
      },
    });

    if (!geozone) {
      return NextResponse.json(
        { error: 'Geozone not found' },
        { status: 404 }
      );
    }

    const fileName = `${name}-v${versionNum}.geojson`;
    const filePath = path.join(GEOZONES_DIR, name, fileName);

    const fileContent = await fs.readFile(filePath);

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/geo+json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download geozone' },
      { status: 500 }
    );
  }
}
