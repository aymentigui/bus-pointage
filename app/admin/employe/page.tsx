"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, MapPin, User, Phone, Building, Calendar, Filter, X } from "lucide-react"
import DivAdmin from "@/components/div-admin"

interface Pointage {
  id: string
  nom: string
  telephone: string
  hotel: string
  type: string
  latitude: number
  longitude: number
  timestamp: string
  createdAt: string
}

interface GroupedPointage {
  nom: string
  telephone: string
  hotel: string
  date: string
  pointages: {
    type: string
    heure: string
    position: { latitude: number; longitude: number }
    createdAt: string
  }[]
}

export default function AdminPointagePage() {
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [filteredPointages, setFilteredPointages] = useState<GroupedPointage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchPointages = async () => {
      try {
        const response = await fetch("/api/employe")
        const data = await response.json()
        setPointages(data)
      } catch (error) {
        console.error("Erreur lors du chargement des pointages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPointages()
  }, [])

  // Grouper les pointages par personne, par hôtel et par date
  const groupPointages = (data: Pointage[]): GroupedPointage[] => {
    const grouped: Record<string, GroupedPointage> = {}

    data.forEach((pointage) => {
      const date = new Date(pointage.timestamp).toLocaleDateString('fr-FR')
      // Ajouter l'hôtel dans la clé de regroupement
      const key = `${pointage.nom}-${pointage.telephone}-${pointage.hotel}-${date}`
      
      if (!grouped[key]) {
        grouped[key] = {
          nom: pointage.nom,
          telephone: pointage.telephone,
          hotel: pointage.hotel,
          date: date,
          pointages: []
        }
      }

      grouped[key].pointages.push({
        type: pointage.type,
        heure: new Date(pointage.timestamp).toLocaleTimeString('fr-FR'),
        position: { latitude: pointage.latitude, longitude: pointage.longitude },
        createdAt: new Date(pointage.createdAt).toLocaleDateString('fr-FR')
      })
    })

    return Object.values(grouped)
  }

  // Effacer tous les filtres
  const clearFilters = () => {
    setSearchTerm("")
    setDateFilter("")
    setTypeFilter("all")
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm !== "" || dateFilter !== "" || typeFilter !== "all"

  // Filtrer les données
  useEffect(() => {
    let filtered = pointages

    // Appliquer les filtres
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(term) || 
        p.telephone.includes(term) || 
        p.hotel.toLowerCase().includes(term)
      )
    }

    if (dateFilter) {
      // Corriger le filtre de date - comparer avec la date ISO
      filtered = filtered.filter(p => {
        const pointageDate = new Date(p.timestamp)
        const filterDate = new Date(dateFilter)
        
        return pointageDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0]
      })
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    setFilteredPointages(groupPointages(filtered))
  }, [pointages, searchTerm, dateFilter, typeFilter])

  // Exporter en CSV
  const exportToCSV = () => {
    // Préparer les données pour l'export (non groupées)
    let exportData = pointages

    // Appliquer les mêmes filtres que pour l'affichage
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      exportData = exportData.filter(p => 
        p.nom.toLowerCase().includes(term) || 
        p.telephone.includes(term) || 
        p.hotel.toLowerCase().includes(term)
      )
    }

    if (dateFilter) {
      // Utiliser la même logique de filtrage que pour l'affichage
      exportData = exportData.filter(p => {
        const pointageDate = new Date(p.timestamp)
        const filterDate = new Date(dateFilter)
        
        return pointageDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0]
      })
    }

    if (typeFilter !== "all") {
      exportData = exportData.filter(p => p.type === typeFilter)
    }

    // Convertir en CSV
    const headers = ["Nom", "Téléphone", "Hôtel", "Date", "Heure", "Type", "Position"]
    const csvData = exportData.map(p => [
      p.nom,
      p.telephone,
      p.hotel,
      new Date(p.timestamp).toLocaleDateString('fr-FR'),
      new Date(p.timestamp).toLocaleTimeString('fr-FR'),
      p.type,
      `${p.latitude}, ${p.longitude}`
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n")

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `pointages_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Ouvrir OpenStreetMap avec la position
  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`, "_blank")
  }

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des données...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <DivAdmin></DivAdmin>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration Pointage Employés</h1>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Effacer les filtres
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Recherche
              </label>
              <Input
                placeholder="Nom, téléphone ou hôtel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="debut">Début</SelectItem>
                  <SelectItem value="fin">Fin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des pointages */}
      <Card>
        <CardHeader>
          <CardTitle>Pointages enregistrés</CardTitle>
          <CardDescription>
            {filteredPointages.length} résultat(s) trouvé(s)
            {hasActiveFilters && " (filtres actifs)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPointages.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">Aucun pointage trouvé</p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pointages</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPointages.map((group, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{group.nom}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {group.telephone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {group.hotel}
                      </div>
                    </TableCell>
                    <TableCell>{group.date}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {group.pointages.map((pointage, pIndex) => (
                          <div key={pIndex} className="flex items-center gap-2">
                            <Badge variant={pointage.type === "debut" ? "default" : "secondary"}>
                              {pointage.type === "debut" ? "Début" : "Fin"}
                            </Badge>
                            <span className="text-sm">{pointage.heure}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.pointages.map((pointage, pIndex) => (
                        <Button
                          key={pIndex}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => openMap(pointage.position.latitude, pointage.position.longitude)}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Voir carte
                        </Button>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}