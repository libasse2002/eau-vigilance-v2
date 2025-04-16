
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DatabaseIcon, 
  UploadIcon,
  FileIcon,
  SearchIcon,
  TrashIcon,
  DownloadIcon,
  RefreshCwIcon
} from "lucide-react";
import { useWaterQualityData } from "@/hooks/useWaterQualityData";
import { useSites } from "@/hooks/useSites";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function DataManagement() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("view");
  
  const { data: waterQualityData = [], isLoading: isDataLoading } = useWaterQualityData(selectedSite);
  const { data: sites = [], isLoading: isSitesLoading } = useSites();
  
  // Filtrer les données
  const filteredData = waterQualityData
    .filter(data => !searchQuery ? true : (
      data.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.siteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.collectedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ));

  // Simuler un téléchargement de fichier CSV
  const handleDownloadCSV = () => {
    toast({
      title: "Téléchargement démarré",
      description: "Le fichier CSV sera bientôt disponible.",
    });
    
    // Dans une implémentation réelle, ici nous génèrerions et téléchargerions le fichier
  };

  // Simuler l'importation de données
  const handleImportData = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Importation simulée",
      description: "Dans une application réelle, vos données seraient importées ici.",
    });
  };

  // Simuler la suppression de données
  const handleDeleteData = () => {
    toast({
      title: "Suppression simulée",
      description: "Cette fonctionnalité supprimera les données sélectionnées.",
      variant: "destructive",
    });
  };

  if (isDataLoading || isSitesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Données</h1>
            <p className="text-muted-foreground">
              Importez, exportez et gérez les données de qualité d'eau
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="view">
              <DatabaseIcon className="h-4 w-4 mr-2" />
              Visualiser
            </TabsTrigger>
            <TabsTrigger value="import">
              <UploadIcon className="h-4 w-4 mr-2" />
              Importer
            </TabsTrigger>
            <TabsTrigger value="export">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exporter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Données de Qualité d'Eau</CardTitle>
                <CardDescription>
                  Visualisez et filtrez toutes les données collectées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher dans les données..."
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
                          {sites?.map(site => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button variant="outline" size="icon">
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={handleDeleteData}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {filteredData.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>pH</TableHead>
                          <TableHead>Température</TableHead>
                          <TableHead>Oxygène Dissous</TableHead>
                          <TableHead>Conductivité</TableHead>
                          <TableHead>Turbidité</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.slice(0, 10).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{format(new Date(item.timestamp), "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell>{sites.find(s => s.id === item.siteId)?.name || item.siteId}</TableCell>
                            <TableCell>{item.pH.toFixed(2)}</TableCell>
                            <TableCell>{item.temperature.toFixed(1)}°C</TableCell>
                            <TableCell>{item.dissolvedOxygen.toFixed(1)} mg/L</TableCell>
                            <TableCell>{item.conductivity.toFixed(0)} μS/cm</TableCell>
                            <TableCell>{item.turbidity.toFixed(1)} NTU</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${item.status === 'normal' ? 'bg-green-100 text-green-800' : 
                                  item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`
                              }>
                                {item.status === 'normal' ? 'Normal' : 
                                  item.status === 'warning' ? 'Avertissement' : 'Critique'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredData.length > 10 && (
                      <div className="flex justify-center p-2 text-sm text-muted-foreground">
                        Affichage de 10 sur {filteredData.length} résultats
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">Aucune donnée disponible</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Il n'y a pas encore de données de qualité d'eau pour ce site.
                    </p>
                    <Button onClick={() => setActiveTab("import")}>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Importer des données
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importation de Données</CardTitle>
                <CardDescription>
                  Importez des données de qualité d'eau depuis des fichiers CSV ou Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImportData} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites?.map(site => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier de données</Label>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                      <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Glissez-déposez un fichier ou cliquez pour parcourir
                      </p>
                      <Input
                        id="file"
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                      />
                      <Button type="button" variant="outline">
                        Parcourir
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Options d'importation</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="replace" className="rounded border-gray-300" />
                        <Label htmlFor="replace">Remplacer les données existantes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="validate" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="validate">Valider avant importation</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("view")}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Importer les données
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportation de Données</CardTitle>
                <CardDescription>
                  Exportez des données de qualité d'eau aux formats CSV ou Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-export">Site</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les sites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les sites</SelectItem>
                        {sites?.map(site => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Période</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date" className="text-xs">Date de début</Label>
                        <Input type="date" id="start-date" />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-xs">Date de fin</Label>
                        <Input type="date" id="end-date" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Format d'exportation</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="format-csv" name="format" className="rounded-full border-gray-300" defaultChecked />
                        <Label htmlFor="format-csv">CSV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="format-excel" name="format" className="rounded-full border-gray-300" />
                        <Label htmlFor="format-excel">Excel</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("view")}>
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleDownloadCSV}>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Exporter les données
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
