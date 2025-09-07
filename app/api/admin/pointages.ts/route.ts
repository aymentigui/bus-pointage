import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get("date")
    const searchQuery = searchParams.get("search")

    const where: any = {}

    if (dateFilter) {
      where.date = dateFilter
    }

    if (searchQuery) {
      where.user = {
        OR: [
          { nom: { contains: searchQuery, mode: "insensitive" } },
          { hotel: { contains: searchQuery, mode: "insensitive" } },
          { telephone: { contains: searchQuery, mode: "insensitive" } },
        ],
      }
    }

    const pointages = await prisma.pointage.findMany({
      where,
      include: {
        user: true,
        buses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(pointages)
  } catch (error) {
    console.error("Erreur lors de la récupération des pointages:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des pointages" }, { status: 500 })
  }
}
