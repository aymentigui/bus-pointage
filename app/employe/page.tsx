"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, User, Phone, Building } from "lucide-react"
import toast from "react-hot-toast"
import DivPublic from "@/components/div-public"

interface UserData {
  nom: string
  telephone: string
  hotel: string
}

interface LocationData {
  latitude: number
  longitude: number
  timestamp: Date
}

export default function PointageApp() {
  const [userData, setUserData] = useState<UserData>({
    nom: "",
    telephone: "",
    hotel: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle")

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedData = localStorage.getItem("pointage-user-data")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setUserData((prev) => ({
          ...prev,
          nom: parsed.nom || "",
          telephone: parsed.telephone || "",
        }))
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      }
    }
  }, [])

  // Sauvegarder nom et téléphone dans localStorage
  const saveUserData = () => {
    const dataToSave = {
      nom: userData.nom,
      telephone: userData.telephone,
    }
    localStorage.setItem("pointage-user-data", JSON.stringify(dataToSave))
  }

  // Obtenir la géolocalisation
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Géolocalisation non supportée"))
        return
      }

      setLocationStatus("requesting")

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus("granted")
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
          })
        },
        (error) => {
          setLocationStatus("denied")
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  // Gérer le pointage
  const handlePointage = async (type: "debut" | "fin") => {
    // Vérifier que tous les champs sont remplis
    if (!userData.nom.trim() || !userData.telephone.trim() || !userData.hotel.trim()) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading("Obtention de votre localisation...")

    try {
      // Obtenir la localisation
      const location = await getCurrentLocation()

      // Sauvegarder les données utilisateur
      saveUserData()

      // Créer l'objet de pointage
      const pointageData = {
        ...userData,
        type,
        location,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/employe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pointageData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la sauvegarde")
      }

      // Console.log comme demandé
      console.log(`Pointage ${type} réussi:`, result.data)
      console.log(`Utilisateur: ${userData.nom}`)
      console.log(`Téléphone: ${userData.telephone}`)
      console.log(`Hôtel: ${userData.hotel}`)
      console.log(`Position: ${location.latitude}, ${location.longitude}`)
      console.log(`Heure: ${new Date().toLocaleString("fr-FR")}`)

      toast.dismiss(loadingToast)
      toast.success(`Pointage ${type === "debut" ? "début" : "fin"} de travail enregistré avec succès!`, {
        duration: 5000,
        icon: type === "debut" ? "🟢" : "🔴",
      })
    } catch (error) {
      console.error(`Erreur lors du pointage ${type}:`, error)
      toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde du pointage", {
        duration: 6000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <DivPublic />
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Pointage Employé</h1>
          </div>
          <p className="text-muted-foreground text-balance">Enregistrez vos heures de travail avec géolocalisation</p>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Employé
            </CardTitle>
            <CardDescription>Vos informations seront sauvegardées pour la prochaine fois</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet</Label>
              <Input
                id="nom"
                type="text"
                placeholder="Votre nom et prénom"
                value={userData.nom}
                onChange={(e) => handleInputChange("nom", e.target.value)}
                className="bg-input border border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numéro de téléphone
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={userData.telephone}
                onChange={(e) => handleInputChange("telephone", e.target.value)}
                className="bg-input border border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hôtel
              </Label>
              <Input
                id="hotel"
                type="text"
                placeholder="Nom de l'hôtel"
                value={userData.hotel}
                onChange={(e) => handleInputChange("hotel", e.target.value)}
                className="bg-input border border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status de géolocalisation */}
        {locationStatus !== "idle" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {locationStatus === "requesting" && "Demande de localisation en cours..."}
                  {locationStatus === "granted" && "Localisation autorisée ✓"}
                  {locationStatus === "denied" && "Localisation refusée ✗"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boutons de pointage */}
        <div className="space-y-3">
          <Button
            onClick={() => handlePointage("debut")}
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Pointage en cours..." : "Début de Travail"}
          </Button>

          <Button
            onClick={() => handlePointage("fin")}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {isLoading ? "Pointage en cours..." : "Fin de Travail"}
          </Button>
        </div>

        {/* Note importante */}
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400" />
              <p className="text-pretty text-orange-800 dark:text-orange-200">
                <strong className="text-orange-900 dark:text-orange-100">Important:</strong> La géolocalisation doit
                être activée pour effectuer le pointage. Vos données personnelles sont sauvegardées localement sur votre
                appareil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
