"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Bus, Calendar, RotateCcw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BusEntry {
  matricule: string
  rotations: number
}

interface DateEntry {
  date: string
  buses: BusEntry[]
}

interface UserData {
  nom: string
  telephone: string
  hotel: string
  pointages: DateEntry[]
}

export default function BusTrackingApp() {
  const [userData, setUserData] = useState<UserData>({
    nom: "",
    telephone: "",
    hotel: "",
    pointages: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addDateEntry = () => {
    const newDate: DateEntry = {
      date: new Date().toISOString().split("T")[0],
      buses: [{ matricule: "", rotations: 1 }],
    }
    setUserData((prev) => ({
      ...prev,
      pointages: [...prev.pointages, newDate],
    }))
  }

  const updateDateEntry = (dateIndex: number, date: string) => {
    const existingDateIndex = userData.pointages.findIndex((entry, index) => entry.date === date && index !== dateIndex)

    if (existingDateIndex !== -1) {
      toast({
        title: "Attention",
        description: "Cette date existe déjà. Les bus seront fusionnés.",
        variant: "default",
      })

      // Fusionner les bus de la date existante avec la nouvelle
      const currentEntry = userData.pointages[dateIndex]
      const existingEntry = userData.pointages[existingDateIndex]

      setUserData((prev) => ({
        ...prev,
        pointages: prev.pointages
          .map((entry, index) => {
            if (index === existingDateIndex) {
              return {
                ...entry,
                buses: [...entry.buses, ...currentEntry.buses],
              }
            }
            return entry
          })
          .filter((_, index) => index !== dateIndex),
      }))
      return
    }

    setUserData((prev) => ({
      ...prev,
      pointages: prev.pointages.map((entry, index) => (index === dateIndex ? { ...entry, date } : entry)),
    }))
  }

  const removeDateEntry = (dateIndex: number) => {
    setUserData((prev) => ({
      ...prev,
      pointages: prev.pointages.filter((_, index) => index !== dateIndex),
    }))
  }

  const addBusEntry = (dateIndex: number) => {
    setUserData((prev) => ({
      ...prev,
      pointages: prev.pointages.map((entry, index) =>
        index === dateIndex ? { ...entry, buses: [...entry.buses, { matricule: "", rotations: 1 }] } : entry,
      ),
    }))
  }

  const updateBusEntry = (dateIndex: number, busIndex: number, field: keyof BusEntry, value: string | number) => {
    setUserData((prev) => ({
      ...prev,
      pointages: prev.pointages.map((entry, dIndex) =>
        dIndex === dateIndex
          ? {
              ...entry,
              buses: entry.buses.map((bus, bIndex) => (bIndex === busIndex ? { ...bus, [field]: value } : bus)),
            }
          : entry,
      ),
    }))
  }

  const removeBusEntry = (dateIndex: number, busIndex: number) => {
    setUserData((prev) => ({
      ...prev,
      pointages: prev.pointages.map((entry, dIndex) =>
        dIndex === dateIndex ? { ...entry, buses: entry.buses.filter((_, bIndex) => bIndex !== busIndex) } : entry,
      ),
    }))
  }

  const handleSubmit = async () => {
    // Validation des données
    if (!userData.nom || !userData.telephone || !userData.hotel) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les informations utilisateur",
        variant: "destructive",
      })
      return
    }

    if (userData.pointages.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un pointage",
        variant: "destructive",
      })
      return
    }

    // Vérifier que tous les pointages ont des bus avec matricules
    for (const pointage of userData.pointages) {
      if (pointage.buses.length === 0 || pointage.buses.some((bus) => !bus.matricule)) {
        toast({
          title: "Erreur",
          description: "Tous les pointages doivent avoir au moins un bus avec un matricule",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/pointage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Pointage enregistré avec succès dans la base de données",
        })

        // Réinitialiser le formulaire
        setUserData({
          nom: "",
          telephone: "",
          hotel: "",
          pointages: [],
        })

        console.log("Données sauvegardées:", result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du pointage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Pointage des Bus</h1>
          </div>
          <p className="text-muted-foreground">Système de suivi et de pointage des rotations de bus</p>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Informations Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  placeholder="Entrez votre nom"
                  value={userData.nom}
                  onChange={(e) => setUserData((prev) => ({ ...prev, nom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Numéro de téléphone</Label>
                <Input
                  id="telephone"
                  placeholder="Entrez votre numéro"
                  value={userData.telephone}
                  onChange={(e) => setUserData((prev) => ({ ...prev, telephone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel">Nom de l'hôtel</Label>
                <Input
                  id="hotel"
                  placeholder="Entrez le nom de l'hôtel"
                  value={userData.hotel}
                  onChange={(e) => setUserData((prev) => ({ ...prev, hotel: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Tracking Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pointages par Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData.pointages.map((dateEntry, dateIndex) => (
              <Card key={dateIndex} className="border-2 border-muted">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <Input
                        type="date"
                        value={dateEntry.date}
                        onChange={(e) => updateDateEntry(dateIndex, e.target.value)}
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeDateEntry(dateIndex)} className="mt-2 sm:mt-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dateEntry.buses.map((bus, busIndex) => (
                    <div key={busIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <Bus className="h-4 w-4 text-secondary flex-shrink-0" />
                        <Input
                          placeholder="Matricule du bus"
                          value={bus.matricule}
                          onChange={(e) => updateBusEntry(dateIndex, busIndex, "matricule", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <RotateCcw className="h-4 w-4 text-secondary flex-shrink-0" />
                        <Input
                          type="number"
                          min="1"
                          placeholder="Rotations"
                          value={bus.rotations}
                          onChange={(e) =>
                            updateBusEntry(dateIndex, busIndex, "rotations", Number.parseInt(e.target.value) || 1)
                          }
                          className="w-full sm:w-24"
                        />
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeBusEntry(dateIndex, busIndex)} className="w-full sm:w-auto mt-2 sm:mt-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => addBusEntry(dateIndex)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un bus
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addDateEntry} className="w-full" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une nouvelle date
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button onClick={handleSubmit} size="lg" className="px-8 w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Valider le Pointage"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}