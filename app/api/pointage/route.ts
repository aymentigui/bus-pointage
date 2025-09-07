import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, telephone, hotel, pointages } = body

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        nom,
        telephone,
        hotel,
      },
    })

    // Créer les pointages avec leurs bus
    for (const pointageData of pointages) {
      await prisma.pointage.create({
        data: {
          date: pointageData.date,
          userId: user.id,
          buses: {
            create: pointageData.buses.map((bus: any) => ({
              matricule: bus.matricule,
              rotations: bus.rotations,
            })),
          },
        },
      })
    }

    // Récupérer les données complètes pour la réponse
    const savedData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pointages: {
          include: {
            buses: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Pointage enregistré avec succès",
      data: savedData,
    })
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'enregistrement du pointage",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const pointages = await prisma.user.findMany({
      include: {
        pointages: {
          include: {
            buses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: pointages,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des pointages",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
