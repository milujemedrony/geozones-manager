import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getNextVersion,
  saveGeozoneFile,
  isValidGeoJSON,
} from "@/lib/geozones";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "NOT_AUTHORIZED", message: "User is not logged in" },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | undefined;

    if (!file || !name) {
      return NextResponse.json(
        { error: "File and name are required" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".geojson")) {
      return NextResponse.json(
        { error: "Only .geojson files are allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isValidGeoJSON(buffer)) {
      return NextResponse.json(
        { error: "Invalid GeoJSON format" },
        { status: 400 }
      );
    }

    const version = await getNextVersion(name);
    const filePath = await saveGeozoneFile(name, version, buffer);

    const geozone = await prisma.geozone.create({
      data: {
        name,
        version,
        filePath,
        fileSize: buffer.length,
        description: description || undefined,
      },
    });

    return NextResponse.json(geozone, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload geozone" },
      { status: 500 }
    );
  }
}
