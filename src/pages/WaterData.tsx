
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWaterQualityData } from "@/hooks/useWaterQualityData";
import { useSites } from "@/hooks/useSites";
import { 
  ThermometerIcon, 
  DropletIcon,
  FlaskConicalIcon,
  DatabaseIcon,
  BarChart3Icon,
  Loader2Icon,
} from "lucide-react";
import { TemperatureChart } from "@/components/water-quality/TemperatureChart";
import { PhChart } from "@/components/water-quality/PhChart";
import { DissolvedOxygenChart } from "@/components/water-quality/DissolvedOxygenChart";
import { MetalsRadarChart } from "@/components/water-quality/MetalsRadarChart";
import { IBGNBarChart } from "@/components/water-quality/IBGNBarChart";

export default function WaterData() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "critical">("all");
  
  const { data: sites, isLoading: isSitesLoading } = useSites();
  const { data: waterQualityData, isLoading: isDataLoading } = useWaterQualityData(selectedSite);
  
  // Si les données sont en cours de chargement, afficher un indicateur
  if (isDataLoading || isSitesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si aucune donnée n'est disponible, afficher un message
  if (!waterQualityData?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <DropletIcon className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Aucune donnée disponible</h2>
        <p className="text-muted-foreground">
          Commencez par ajouter des données de qualité d'eau pour voir les visualisations.
        </p>
      </div>
    );
  }

  // Filtrer les données en fonction des critères
  const filteredData = waterQualityData
    .filter(data => !searchQuery ? true : (
      data.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.site_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.collected_by.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    .filter(data => statusFilter === "all" ? true : data.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Qualité de l'Eau</h1>
            <p className="text-muted-foreground">
              Analyses et visualisations des données de qualité de l'eau
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exporter (PDF)
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des données..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="w-[180px]">
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les sites</SelectItem>
                      {miningSites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="warning">Avertissement</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="physico-chemical" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="physico-chemical">
            <ThermometerIcon className="h-4 w-4 mr-2" />
            Physico-Chimique
          </TabsTrigger>
          <TabsTrigger value="biological">
            <FlaskConicalIcon className="h-4 w-4 mr-2" />
            Biologique
          </TabsTrigger>
          <TabsTrigger value="metals">
            <DropletIcon className="h-4 w-4 mr-2" />
            Métaux Lourds
          </TabsTrigger>
          <TabsTrigger value="chemicals">
            <DatabaseIcon className="h-4 w-4 mr-2" />
            Chimiques Spécifiques
          </TabsTrigger>
          <TabsTrigger value="summary">
            <BarChart3Icon className="h-4 w-4 mr-2" />
            Synthèse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physico-chemical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Température</CardTitle>
              <CardDescription>
                Évolution de la température avec variations saisonnières et seuils critiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemperatureChart data={filteredData} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>pH</CardTitle>
              <CardDescription>
                Évolution du pH avec plage optimale mise en évidence (6,5-8,5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhChart data={filteredData} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Oxygène Dissous</CardTitle>
              <CardDescription>
                Oxygène dissous avec zones de qualité et corrélation avec la température
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DissolvedOxygenChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biological" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indice Biologique Global Normalisé (IBGN)</CardTitle>
              <CardDescription>
                Indice biologique indiquant la qualité globale de l'eau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IBGNBarChart data={filteredData} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Coliformes Fécaux & E. coli</CardTitle>
              <CardDescription>
                Indicateurs de contamination fécale (échelle logarithmique)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                <p>Cette visualisation sera disponible dans une mise à jour future.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métaux Lourds</CardTitle>
              <CardDescription>
                Visualisation comparative de tous les métaux lourds relative aux seuils réglementaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetalsRadarChart data={filteredData} siteId={selectedSite === "all" ? undefined : selectedSite} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chemicals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hydrocarbures & Solvants Organiques</CardTitle>
              <CardDescription>
                Concentrations relatives aux normes réglementaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                <p>Cette visualisation sera disponible dans une mise à jour future.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pesticides</CardTitle>
              <CardDescription>
                Concentrations de pesticides et polluants organiques persistants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                <p>Cette visualisation sera disponible dans une mise à jour future.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Synthèse de Qualité des Eaux</CardTitle>
              <CardDescription>
                Vue d'ensemble multi-paramètres pour tous les sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                <p>Cette visualisation sera disponible dans une mise à jour future.</p>
                <p className="mt-2">Elle combinera les indicateurs clés en un tableau de bord synthétique.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
