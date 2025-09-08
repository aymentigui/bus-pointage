import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(request: Request) {
    try {
        const pointages = await prisma.pointage_employe.findMany({
            orderBy: {
                timestamp: "desc"
            }
        })
        return NextResponse.json(pointages, { status: 200 })
    } catch (error) {
        console.error("Erreur lors de la récupération des pointages:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { nom, telephone, hotel, type, location } = body

        // Validation des données
        if (!nom || !telephone || !hotel || !type || !location) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
        }

        if (type !== "debut" && type !== "fin") {
            return NextResponse.json({ error: "Type de pointage invalide" }, { status: 400 })
        }

        // Créer le pointage en base de données
        const pointage = await prisma.pointage_employe.create({
            data: {
                nom,
                telephone,
                hotel,
                type,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date(body.timestamp),
            },
        })

        console.log(`[API] Pointage ${type} sauvegardé:`, pointage)

        return NextResponse.json({
            success: true,
            data: pointage,
            message: `Pointage ${type} enregistré avec succès`,
        })
    } catch (error) {
        console.error("[API] Erreur lors de la sauvegarde:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}