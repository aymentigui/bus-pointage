"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Phone, Building2, Bus, User } from "lucide-react"

interface BusEntry {
  id: string
  matricule: string
  rotations: number
}

interface PointageUser {
  id: string
  nom: string
  telephone: string
  hotel: string
}

interface Pointage {
  id: string
  date: string
  user: PointageUser
  buses: BusEntry[]
  createdAt: string
}

export default function AdminPage() {
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [filteredPointages, setFilteredPointages] = useState<Pointage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const fetchPointages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateFilter) params.append("date", dateFilter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/pointages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPointages(data)
        setFilteredPointages(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pointages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPointages()
  }, [])

  useEffect(() => {
    fetchPointages()
  }, [searchQuery, dateFilter])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDateFilter("")
  }

  const totalRotations = filteredPointages.reduce((total, pointage) => {
    return total + pointage.buses.reduce((busTotal, bus) => busTotal + bus.rotations, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Administration des Pointages</h1>
          <p className="text-slate-600">Gestion et suivi de tous les pointages de bus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredPointages.length}</p>
                  <p className="text-sm text-slate-600">Pointages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bus className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{totalRotations}</p>
                  <p className="text-sm text-slate-600">Total Rotations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{new Set(filteredPointages.map((p) => p.user.hotel)).size}</p>
                  <p className="text-sm text-slate-600">Hôtels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtres de Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <Input
                  placeholder="Nom, hôtel ou téléphone..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                  Effacer les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-600">Chargement des pointages...</p>
              </CardContent>
            </Card>
          ) : filteredPointages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-600">Aucun pointage trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredPointages.map((pointage) => (
              <Card key={pointage.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        {pointage.user.nom}
                      </CardTitle>
                      <CardDescription>Pointage du {pointage.date}</CardDescription>
                    </div>
                    <Badge variant="secondary">{pointage.buses.length} bus</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{pointage.user.telephone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{pointage.user.hotel}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bus className="h-4 w-4" />
                      Détails des Bus
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {pointage.buses.map((bus) => (
                        <div key={bus.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                          <span className="font-medium">{bus.matricule}</span>
                          <Badge variant="outline">
                            {bus.rotations} rotation{bus.rotations > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Créé le {new Date(pointage.createdAt).toLocaleString("fr-FR")}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
