import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from './prisma';

const GEOZONES_DIR = path.join(process.cwd(), 'public', 'geozones');

export async function ensureGeozonesDir() {
  try {
    await fs.mkdir(GEOZONES_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create geozones directory:', error);
    throw error;
  }
}

export async function getNextVersion(name: string): Promise<number> {
  const latestGeozone = await prisma.geozone.findMany({
    where: { name },
    orderBy: { version: 'desc' },
    take: 1,
  });

  return latestGeozone.length > 0 ? latestGeozone[0].version + 1 : 1;
}

export async function saveGeozoneFile(
  name: string,
  version: number,
  buffer: Buffer
): Promise<string> {
  const dirPath = path.join(GEOZONES_DIR, name);

  await ensureGeozonesDir();
  await fs.mkdir(dirPath, { recursive: true });

  const fileName = `${name}-v${version}.geojson`;
  const filePath = path.join(dirPath, fileName);

  await fs.writeFile(filePath, new Uint8Array(buffer));

  return `/geozones/${name}/${fileName}`;
}

export async function deleteGeozoneFile(name: string, version: number): Promise<void> {
  const fileName = `${name}-v${version}.geojson`;
  const filePath = path.join(GEOZONES_DIR, name, fileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete geozone file:', error);
  }
}

export function isValidGeoJSON(buffer: Buffer): boolean {
  try {
    const content = buffer.toString('utf-8');
    const parsed = JSON.parse(content);

    if (typeof parsed !== 'object' || parsed === null) {
      return false;
    }

    if (parsed.type && parsed.type === 'FeatureCollection') {
      return Array.isArray(parsed.features);
    }

    if (parsed.type && parsed.type === 'Feature') {
      return parsed.geometry !== undefined;
    }

    if (parsed.type === 'Point' ||
        parsed.type === 'LineString' ||
        parsed.type === 'Polygon' ||
        parsed.type === 'MultiPoint' ||
        parsed.type === 'MultiLineString' ||
        parsed.type === 'MultiPolygon' ||
        parsed.type === 'GeometryCollection') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
