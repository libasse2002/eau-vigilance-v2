
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { miningSites, waterQualityData } from "@/data/mockData";
import { WaterQualityData } from "@/types";
import { 
  Activity as ActivityIcon, 
  Download as DownloadIcon, 
  Droplet as DropletIcon, 
  FlaskConical as FlaskConicalIcon, 
  Thermometer as ThermometerIcon,
  Virus as VirusIcon,
  Database as DatabaseIcon
} from "lucide-react";
import { AdvancedWaterQualityChart } from "@/components/water-quality/AdvancedWaterQualityChart";
import { Button } from "@/components/ui/button";
import { MetalsRadarChart } from "@/components/water-quality/MetalsRadarChart";
import { IBGNBarChart } from "@/components/water-quality/IBGNBarChart";

export default function AdvancedVisualization() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  
  // Filter data based on selected site
  const filteredData = waterQualityData
    .filter(data => selectedSite === "all" ? true : data.siteId === selectedSite)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Water Quality Visualization</h1>
            <p className="text-muted-foreground">
              Detailed analysis and visualization of water quality parameters
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Charts
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-[250px]">
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {miningSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing data from {selectedSite === "all" ? "all sites" : `site: ${selectedSite}`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="physical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="physical">
            <ThermometerIcon className="h-4 w-4 mr-2" />
            Physical
          </TabsTrigger>
          <TabsTrigger value="chemical">
            <DatabaseIcon className="h-4 w-4 mr-2" />
            Chemical
          </TabsTrigger>
          <TabsTrigger value="biological">
            <FlaskConicalIcon className="h-4 w-4 mr-2" />
            Biological
          </TabsTrigger>
          <TabsTrigger value="metals">
            <DropletIcon className="h-4 w-4 mr-2" />
            Heavy Metals
          </TabsTrigger>
          <TabsTrigger value="pathogens">
            <VirusIcon className="h-4 w-4 mr-2" />
            Pathogens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trends</CardTitle>
              <CardDescription>
                Temperature evolution with seasonal variations and critical thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedWaterQualityChart
                data={filteredData}
                parameter="temperature"
                title="Water Temperature"
                chartType="area"
                color="#ef4444"
                threshold={{
                  min: 10,
                  max: 30,
                }}
                showSeasonalBackground={true}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>pH Levels</CardTitle>
              <CardDescription>
                pH evolution with optimal range highlighted (6.5-8.5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedWaterQualityChart
                data={filteredData}
                parameter="pH"
                title="Water pH"
                chartType="area"
                color="#3b82f6"
                threshold={{
                  min: 6.5,
                  max: 8.5,
                }}
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dissolved Oxygen</CardTitle>
                <CardDescription>
                  Dissolved oxygen with quality zones and temperature correlation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="dissolvedOxygen"
                  title="Dissolved Oxygen and Temperature"
                  chartType="composed"
                  color="#22c55e"
                  threshold={{
                    min: 3,
                    zones: [
                      { value: 7, label: "Excellent", color: "#22c55e" },
                      { value: 5, label: "Good", color: "#eab308" },
                      { value: 3, label: "Concerning", color: "#f97316" },
                    ]
                  }}
                  secondaryParameter="temperature"
                  secondaryColor="#ef4444"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Turbidity</CardTitle>
                <CardDescription>
                  Water clarity measured by turbidity (NTU)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="turbidity"
                  title="Water Turbidity"
                  chartType="bar"
                  color="#92400e"
                  threshold={{
                    max: 5,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chemical" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nitrogen Compounds</CardTitle>
                <CardDescription>
                  Combined visualization of nitrates, nitrites and ammonium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="nitrates"
                  title="Nitrates"
                  chartType="area"
                  color="#3b82f6"
                  threshold={{
                    max: 50,
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Phosphates</CardTitle>
                <CardDescription>
                  Phosphate levels with eutrophication threshold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="phosphates"
                  title="Phosphates"
                  chartType="bar"
                  color="#f59e0b"
                  threshold={{
                    max: 0.5,
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Conductivity</CardTitle>
              <CardDescription>
                Electrical conductivity indicating dissolved salts and minerals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedWaterQualityChart
                data={filteredData}
                parameter="conductivity"
                title="Electrical Conductivity"
                chartType="area"
                color="#8b5cf6"
                threshold={{
                  min: 100,
                  max: 2000,
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Suspended Solids</CardTitle>
              <CardDescription>
                Total suspended solids concentration (MES)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedWaterQualityChart
                data={filteredData}
                parameter="suspendedSolids"
                title="Suspended Solids"
                chartType="bar"
                color="#737373"
                threshold={{
                  max: 30,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biological" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fecal Indicators</CardTitle>
              <CardDescription>
                Fecal coliforms and E. coli with logarithmic scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedWaterQualityChart
                data={filteredData}
                parameter="fecalColiforms"
                title="Fecal Coliforms (CFU/100mL)"
                chartType="bar"
                color="#ef4444"
                logarithmic={true}
                threshold={{
                  zones: [
                    { value: 0, label: "Potable", color: "#22c55e" },
                    { value: 500, label: "Bathing", color: "#eab308" },
                    { value: 1000, label: "Critical", color: "#ef4444" },
                  ]
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>IBGN Score</CardTitle>
              <CardDescription>
                Biological index indicating overall water quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IBGNBarChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Heavy Metals Radar</CardTitle>
              <CardDescription>
                Comparative visualization of all heavy metals relative to regulatory thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetalsRadarChart data={filteredData} siteId={selectedSite === "all" ? undefined : selectedSite} />
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead & Mercury</CardTitle>
                <CardDescription>
                  Most toxic heavy metals concentration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="lead"
                  title="Lead and Mercury"
                  chartType="composed"
                  color="#7c3aed"
                  threshold={{
                    max: 10,
                  }}
                  secondaryParameter="mercury"
                  secondaryColor="#ef4444"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Other Heavy Metals</CardTitle>
                <CardDescription>
                  Arsenic, Cadmium and Chromium levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWaterQualityChart
                  data={filteredData}
                  parameter="arsenic"
                  title="Arsenic"
                  chartType="bar"
                  color="#10b981"
                  threshold={{
                    max: 10,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pathogens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pathogen Detection</CardTitle>
              <CardDescription>
                Presence/absence of detected pathogens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                <p>Pathogen visualization requires additional data integration.</p>
                <p>This feature will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
