"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Calendar, Phone, Building2, Bus, User, Download } from "lucide-react"
import DivAdmin from "@/components/div-admin"

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

interface GroupedPointage {
  hotel: string
  pointages: Pointage[]
  totalRotations: number
  userCount: number
}

export default function AdminPage() {
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [filteredPointages, setFilteredPointages] = useState<Pointage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [busesCount, setBusesCount] = useState(0)

  const fetchPointages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pointages')
      if (response.ok) {
        const data = await response.json()
        setPointages(data)
        setFilteredPointages(data)
        const allBuses = data.flatMap((pointage: any) => pointage.buses)
        const uniqueBuses = new Set(allBuses.map((bus: any) => bus.id))
        setBusesCount(uniqueBuses.size)
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
    // Filtrer les pointages en fonction des critères de recherche
    let filtered = [...pointages]
    
    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter(pointage => pointage.date === dateFilter)
    }
    
    // Filtre par recherche (nom, hôtel ou téléphone)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pointage => 
        pointage.user.nom.toLowerCase().includes(query) ||
        pointage.user.hotel.toLowerCase().includes(query) ||
        pointage.user.telephone.includes(query)
      )
    }
    
    setFilteredPointages(filtered)
  }, [searchQuery, dateFilter, pointages])

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

  const groupPointagesByHotel = (pointages: Pointage[]): GroupedPointage[] => {
    const grouped = pointages.reduce(
      (acc, pointage) => {
        const hotel = pointage.user.hotel
        if (!acc[hotel]) {
          acc[hotel] = {
            hotel,
            pointages: [],
            totalRotations: 0,
            userCount: 0,
          }
        }
        acc[hotel].pointages.push(pointage)
        acc[hotel].totalRotations += pointage.buses.reduce((total, bus) => total + bus.rotations, 0)
        return acc
      },
      {} as Record<string, GroupedPointage>,
    )

    // Calculer le nombre d'utilisateurs uniques par hôtel
    Object.values(grouped).forEach((group) => {
      const uniqueUsers = new Set(group.pointages.map((p) => p.user.id))
      group.userCount = uniqueUsers.size
    })

    return Object.values(grouped).sort((a, b) => a.hotel.localeCompare(b.hotel))
  }

  const totalRotations = filteredPointages.reduce((total, pointage) => {
    return total + pointage.buses.reduce((busTotal, bus) => busTotal + bus.rotations, 0)
  }, 0)

  const groupedPointages = groupPointagesByHotel(filteredPointages)

  // Fonction pour exporter les données en Excel
  const exportToExcel = () => {
    // Préparer les données pour l'export
    const dataToExport = filteredPointages.flatMap(pointage => 
      pointage.buses.map(bus => ({
        "Nom": pointage.user.nom,
        "Téléphone": pointage.user.telephone,
        "Hôtel": pointage.user.hotel,
        "Date": pointage.date,
        "Matricule Bus": bus.matricule,
        "Rotations": bus.rotations
      }))
    )
  
    // Créer un fichier CSV avec BOM pour UTF-8
    const headers = ["Nom", "Téléphone", "Hôtel", "Date", "Matricule Bus", "Rotations"]
    const csvContent = [
      "\uFEFF" + headers.join(","), // BOM pour UTF-8
      ...dataToExport.map(row => 
        Object.values(row).map(value => `"${value}"`).join(",")
      )
    ].join("\n")
  
    // Créer un blob avec le bon type MIME
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `pointages_bus_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <DivAdmin></DivAdmin>
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
                  <p className="text-2xl font-bold">{busesCount}</p>
                  <p className="text-sm text-slate-600">Nombre bus totale</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Export</label>
                <Button 
                  onClick={exportToExcel} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={filteredPointages.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Pointages Groupés par Hôtel
                </CardTitle>
                <CardDescription>
                  {filteredPointages.length} pointage{filteredPointages.length > 1 ? "s" : ""} dans{" "}
                  {groupedPointages.length} hôtel{groupedPointages.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
              {filteredPointages.length > 0 && (
                <Button 
                  onClick={exportToExcel} 
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-slate-600">Chargement des pointages...</p>
              </div>
            ) : filteredPointages.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-600">Aucun pointage trouvé</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedPointages.map((group) => (
                  <div key={group.hotel} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-purple-600" />
                          <h3 className="font-semibold text-lg">{group.hotel}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>
                            {group.userCount} utilisateur{group.userCount > 1 ? "s" : ""}
                          </span>
                          <span>
                            {group.pointages.length} pointage{group.pointages.length > 1 ? "s" : ""}
                          </span>
                          <Badge variant="secondary">{group.totalRotations} rotations</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Total Rotations</TableHead>
                            <TableHead>Créé le</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.pointages.map((pointage) => (
                            <TableRow key={pointage.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  {pointage.user.nom}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-slate-500" />
                                  {pointage.user.telephone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{pointage.date}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {pointage.buses.map((bus) => (
                                    <div key={bus.id} className="flex items-center gap-2 text-sm">
                                      <Bus className="h-3 w-3 text-green-600" />
                                      <span className="font-mono">{bus.matricule}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {bus.rotations}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">
                                  {pointage.buses.reduce((total, bus) => total + bus.rotations, 0)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
                                {new Date(pointage.createdAt).toLocaleDateString("fr-FR")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}