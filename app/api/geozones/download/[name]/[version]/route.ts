import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

const GEOZONES_DIR = path.join(process.cwd(), "public", "geozones");

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string; version: string } }
) {
  try {
    const { name, version } = params;

    if (name.includes("../") || version.includes("../")) {
      return NextResponse.json(
        { error: "What are you trying to do?" },
        { status: 500 }
      );
    }

    const versionNum = parseInt(version, 10);

    if (isNaN(versionNum)) {
      return NextResponse.json(
        { error: "Invalid version number" },
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

    const session = await getServerAuthSession();
    if (!session || !session.user || !session.user.email) {
      const latestGeozone = await prisma.geozone.findFirst({
        where: { name },
        orderBy: { version: "desc" },
        take: 1,
      });

      if (!latestGeozone || versionNum < latestGeozone.version - 1) {
        return NextResponse.json(
          { error: "Geozone not found" },
          { status: 404 }
        );
      }
    }

    if (!geozone) {
      return NextResponse.json({ error: "Geozone not found" }, { status: 404 });
    }

    const fileName = `${name}-v${versionNum}.geojson`;
    const filePath = path.join(GEOZONES_DIR, name, fileName);

    const fileContent = await fs.readFile(filePath);

    //@ts-ignore - toto je ten najhorsi napad ale teraz fakt neviem ako to fixnut tak snad to nebude nejaky exploit
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/geo+json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download geozone" },
      { status: 500 }
    );
  }
}
