import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forPublic = searchParams.get("public") === "true";

    if (forPublic) {
      const latestGeozones = await prisma.geozone.findMany({
        orderBy: [{ name: "asc" }, { version: "desc" }],
        distinct: ["name"],
      });
      return NextResponse.json({
        success: true,
        data: latestGeozones,
      });
    } else {

    const session = await getServerAuthSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "NOT_AUTHORIZED", message: "User is not logged in" },
        { status: 401 }
      );
    }

    const geozones = await prisma.geozone.findMany({
      orderBy: [{ name: "asc" }, { version: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: geozones,
    });
    }
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to list geozones" },
      { status: 500 }
    );
  }
}
