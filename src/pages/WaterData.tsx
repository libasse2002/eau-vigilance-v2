
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { miningSites, waterQualityData } from "@/data/mockData";
import { WaterQualityData } from "@/types";
import { format } from "date-fns";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";

export default function WaterData() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "critical">("all");
  
  // Filter the data based on site, search, and status
  const filteredData = waterQualityData
    .filter(data => {
      if (selectedSite === "all") return true;
      return data.siteId === selectedSite;
    })
    .filter(data => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        data.id.toLowerCase().includes(query) ||
        data.siteId.toLowerCase().includes(query) ||
        data.collectedBy.toLowerCase().includes(query)
      );
    })
    .filter(data => {
      if (statusFilter === "all") return true;
      return data.status === statusFilter;
    })
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Records</CardTitle>
          <CardDescription>
            {filteredData.length} water quality measurements found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 font-medium p-3 border-b bg-muted/50">
              <div>Date</div>
              <div>Site</div>
              <div>Status</div>
              <div>pH</div>
              <div>Temperature</div>
              <div>Dissolv. Oxygen</div>
              <div>Turbidity</div>
            </div>
            
            <div className="divide-y max-h-[600px] overflow-auto">
              {filteredData.length > 0 ? (
                filteredData.map((data) => (
                  <div key={data.id} className="grid grid-cols-7 p-3 text-sm hover:bg-muted/50">
                    <div>{format(new Date(data.timestamp), "MMM d, yyyy h:mm a")}</div>
                    <div>{getSiteName(data.siteId)}</div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(data.status)}`}>
                        {data.status}
                      </span>
                    </div>
                    <div className="font-medium">{data.pH.toFixed(2)}</div>
                    <div>{data.temperature.toFixed(1)}°C</div>
                    <div>{data.dissolvedOxygen.toFixed(2)} mg/L</div>
                    <div>{data.turbidity.toFixed(2)} NTU</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No data records match your filters. Try adjusting your search criteria.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Statistics</CardTitle>
          <CardDescription>
            Statistical analysis of filtered water quality data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {filteredData.length > 0 ? (
              <>
                <StatCard 
                  title="pH" 
                  avg={calculateAverage(filteredData.map(d => d.pH))} 
                  min={Math.min(...filteredData.map(d => d.pH))}
                  max={Math.max(...filteredData.map(d => d.pH))}
                />
                <StatCard 
                  title="Temperature" 
                  avg={calculateAverage(filteredData.map(d => d.temperature))} 
                  min={Math.min(...filteredData.map(d => d.temperature))}
                  max={Math.max(...filteredData.map(d => d.temperature))}
                  unit="°C"
                />
                <StatCard 
                  title="Dissolved Oxygen" 
                  avg={calculateAverage(filteredData.map(d => d.dissolvedOxygen))} 
                  min={Math.min(...filteredData.map(d => d.dissolvedOxygen))}
                  max={Math.max(...filteredData.map(d => d.dissolvedOxygen))}
                  unit="mg/L"
                />
                <StatCard 
                  title="Conductivity" 
                  avg={calculateAverage(filteredData.map(d => d.conductivity))} 
                  min={Math.min(...filteredData.map(d => d.conductivity))}
                  max={Math.max(...filteredData.map(d => d.conductivity))}
                  unit="μS/cm"
                />
                <StatCard 
                  title="Turbidity" 
                  avg={calculateAverage(filteredData.map(d => d.turbidity))} 
                  min={Math.min(...filteredData.map(d => d.turbidity))}
                  max={Math.max(...filteredData.map(d => d.turbidity))}
                  unit="NTU"
                />
              </>
            ) : (
              <div className="md:col-span-5 p-4 text-center text-muted-foreground">
                No data available for statistical analysis.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility function to calculate average
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

// Stat card component for displaying statistics
function StatCard({ 
  title, 
  avg, 
  min, 
  max, 
  unit = "" 
}: { 
  title: string; 
  avg: number; 
  min: number; 
  max: number; 
  unit?: string;
}) {
  return (
    <div className="bg-muted/50 rounded-md p-3">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Avg</div>
          <div className="font-medium">{avg.toFixed(1)}{unit}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Min</div>
          <div className="font-medium">{min.toFixed(1)}{unit}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Max</div>
          <div className="font-medium">{max.toFixed(1)}{unit}</div>
        </div>
      </div>
    </div>
  );
}
