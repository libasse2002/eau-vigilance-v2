
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { miningSites, waterQualityData } from "@/data/mockData";
import { WaterQualityData } from "@/types";
import { format } from "date-fns";
import { ActivityIcon, DownloadIcon, DropletIcon, FilterIcon, FlaskConicalIcon, SearchIcon, ThermometerIcon } from "lucide-react";
import { WaterQualityParameterCard } from "@/components/water-quality/WaterQualityParameterCard";
import { WaterQualityChart } from "@/components/dashboard/WaterQualityChart";

export default function WaterData() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "critical">("all");
  const [selectedParameter, setSelectedParameter] = useState<keyof WaterQualityData>("temperature");
  
  // Filter the data based on site, search, and status
  const filteredData = waterQualityData
    .filter(data => selectedSite === "all" ? true : data.siteId === selectedSite)
    .filter(data => !searchQuery ? true : (
      data.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.siteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.collectedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    .filter(data => statusFilter === "all" ? true : data.status === statusFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get site name by ID
    const getSiteName = (siteId: string) => {
      const site = miningSites.find(site => site.id === siteId);
      return site ? site.name : "Unknown Site";
    };
    
    // Get status class for styling
    const getStatusClass = (status: "normal" | "warning" | "critical") => {
      switch (status) {
        case "normal":
          return "bg-alert-low/10 text-alert-low";
        case "warning":
          return "bg-alert-medium/10 text-alert-medium";
        case "critical":
          return "bg-alert-high/10 text-alert-high";
        default:
          return "bg-muted text-muted-foreground";
      }
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Water Quality Data</h1>
            <p className="text-muted-foreground">
              Browse, filter, and analyze water quality measurements
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Data
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
                    placeholder="Search data points..."
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
                
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <ActivityIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="physico-chemical">
            <ThermometerIcon className="h-4 w-4 mr-2" />
            Physico-Chemical
          </TabsTrigger>
          <TabsTrigger value="biological">
            <FlaskConicalIcon className="h-4 w-4 mr-2" />
            Biological
          </TabsTrigger>
          <TabsTrigger value="metals">
            <DropletIcon className="h-4 w-4 mr-2" />
            Heavy Metals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Parameter Trends</CardTitle>
              <CardDescription>Historical trends of key water quality parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Select 
                  value={selectedParameter as string} 
                  onValueChange={(value: string) => setSelectedParameter(value as keyof WaterQualityData)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="pH">pH</SelectItem>
                    <SelectItem value="dissolvedOxygen">Dissolved Oxygen</SelectItem>
                    <SelectItem value="conductivity">Conductivity</SelectItem>
                    <SelectItem value="turbidity">Turbidity</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="h-[400px]">
                  <WaterQualityChart
                    data={filteredData}
                    parameter={selectedParameter as any}
                    threshold={{
                      min: getParameterThreshold(selectedParameter).min,
                      max: getParameterThreshold(selectedParameter).max,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physico-chemical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <WaterQualityParameterCard
              title="Temperature"
              unit="°C"
              data={filteredData}
              parameter="temperature"
              threshold={{ min: 10, max: 30 }}
            />
            <WaterQualityParameterCard
              title="pH"
              data={filteredData}
              parameter="pH"
              threshold={{ min: 6.5, max: 8.5 }}
            />
            <WaterQualityParameterCard
              title="Dissolved Oxygen"
              unit="mg/L"
              data={filteredData}
              parameter="dissolvedOxygen"
              threshold={{ min: 5, max: 9 }}
            />
            <WaterQualityParameterCard
              title="Conductivity"
              unit="μS/cm"
              data={filteredData}
              parameter="conductivity"
              threshold={{ min: 100, max: 2000 }}
            />
            <WaterQualityParameterCard
              title="Turbidity"
              unit="NTU"
              data={filteredData}
              parameter="turbidity"
              threshold={{ min: 0, max: 5 }}
            />
            <WaterQualityParameterCard
              title="Nitrates"
              unit="mg/L"
              data={filteredData}
              parameter="nitrates"
              threshold={{ min: 0, max: 50 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="biological" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <WaterQualityParameterCard
              title="Fecal Coliforms"
              unit="CFU/100mL"
              data={filteredData}
              parameter="fecalColiforms"
              threshold={{ min: 0, max: 200 }}
            />
            <WaterQualityParameterCard
              title="E. coli"
              unit="CFU/100mL"
              data={filteredData}
              parameter="eColi"
              threshold={{ min: 0, max: 100 }}
            />
            <WaterQualityParameterCard
              title="IBGN Score"
              data={filteredData}
              parameter="ibgn"
              threshold={{ min: 0, max: 20 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="metals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <WaterQualityParameterCard
              title="Lead (Pb)"
              unit="μg/L"
              data={filteredData}
              parameter="lead"
              threshold={{ min: 0, max: 10 }}
            />
            <WaterQualityParameterCard
              title="Mercury (Hg)"
              unit="μg/L"
              data={filteredData}
              parameter="mercury"
              threshold={{ min: 0, max: 1 }}
            />
            <WaterQualityParameterCard
              title="Arsenic (As)"
              unit="μg/L"
              data={filteredData}
              parameter="arsenic"
              threshold={{ min: 0, max: 10 }}
            />
            <WaterQualityParameterCard
              title="Cadmium (Cd)"
              unit="μg/L"
              data={filteredData}
              parameter="cadmium"
              threshold={{ min: 0, max: 3 }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Utility function to get parameter thresholds
function getParameterThreshold(parameter: keyof WaterQualityData) {
  const thresholds: Record<string, { min: number; max: number }> = {
    temperature: { min: 10, max: 30 },
    pH: { min: 6.5, max: 8.5 },
    dissolvedOxygen: { min: 5, max: 9 },
    conductivity: { min: 100, max: 2000 },
    turbidity: { min: 0, max: 5 },
    nitrates: { min: 0, max: 50 },
    fecalColiforms: { min: 0, max: 200 },
    eColi: { min: 0, max: 100 },
    ibgn: { min: 0, max: 20 },
    lead: { min: 0, max: 10 },
    mercury: { min: 0, max: 1 },
    arsenic: { min: 0, max: 10 },
    cadmium: { min: 0, max: 3 }
  };
  
  return thresholds[parameter as string] || { min: 0, max: 100 };
}
