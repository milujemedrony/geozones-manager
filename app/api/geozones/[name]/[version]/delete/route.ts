import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteGeozoneFile } from "@/lib/geozones";
import { getServerAuthSession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string; version: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "NOT_AUTHORIZED", message: "User is not logged in" },
        { status: 401 }
      );
    }
    const { name, version } = params;
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

    if (!geozone) {
      return NextResponse.json({ error: "Geozone not found" }, { status: 404 });
    }

    await deleteGeozoneFile(name, versionNum);

    await prisma.geozone.delete({
      where: {
        name_version: {
          name,
          version: versionNum,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete geozone" },
      { status: 500 }
    );
  }
}
