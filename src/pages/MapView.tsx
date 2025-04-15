
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { miningSites, waterQualityData } from "@/data/mockData";
import { MiningSite, WaterQualityData } from "@/types";

export default function MapView() {
  const [selectedSite, setSelectedSite] = useState<string>(miningSites[0].id);
  
  // Get selected site data
  const site = miningSites.find(site => site.id === selectedSite) as MiningSite;
  
  // Filter water quality data for selected site
  const siteData = waterQualityData
    .filter(data => data.siteId === selectedSite)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Parse the data into GeoJSON format for map
  const dataPoints = siteData.map(point => ({
    type: "Feature",
    properties: {
      id: point.id,
      status: point.status,
      pH: point.pH,
      temperature: point.temperature,
      dissolvedOxygen: point.dissolvedOxygen,
      conductivity: point.conductivity,
      turbidity: point.turbidity,
      timestamp: point.timestamp,
    },
    geometry: {
      type: "Point",
      coordinates: [point.location.longitude, point.location.latitude],
    },
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Water Quality Map</h1>
          <p className="text-muted-foreground">
            Geospatial view of water quality monitoring data
          </p>
        </div>
        
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select a site" />
          </SelectTrigger>
          <SelectContent>
            {miningSites.map(site => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{site.name} - Water Quality Map</CardTitle>
          <CardDescription>
            Spatial distribution of water quality readings and risk zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-md bg-muted p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">
                Interactive map visualization would go here.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Requires implementation with mapbox or a similar mapping library.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-2 bg-alert-low/10 rounded-md text-sm">
                  <span className="font-medium text-alert-low">Normal readings</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {siteData.filter(d => d.status === "normal").length} points
                  </p>
                </div>
                <div className="p-2 bg-alert-medium/10 rounded-md text-sm">
                  <span className="font-medium text-alert-medium">Warning readings</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {siteData.filter(d => d.status === "warning").length} points
                  </p>
                </div>
                <div className="p-2 bg-alert-high/10 rounded-md text-sm">
                  <span className="font-medium text-alert-high">Critical readings</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {siteData.filter(d => d.status === "critical").length} points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Data Collection Points</CardTitle>
            <CardDescription>
              Locations where water quality data has been collected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 font-medium p-3 border-b">
                <div>Date</div>
                <div>Status</div>
                <div>Location</div>
                <div>Parameters</div>
              </div>
              <div className="divide-y max-h-[300px] overflow-auto">
                {siteData.slice(0, 10).map((data) => (
                  <div key={data.id} className="grid grid-cols-4 p-3 text-sm">
                    <div>{new Date(data.timestamp).toLocaleDateString()}</div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        data.status === "critical" 
                          ? "bg-alert-high/10 text-alert-high" 
                          : data.status === "warning" 
                          ? "bg-alert-medium/10 text-alert-medium"
                          : "bg-alert-low/10 text-alert-low"
                      }`}>
                        {data.status}
                      </span>
                    </div>
                    <div className="text-xs">
                      {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        pH: {data.pH.toFixed(1)}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Temp: {data.temperature.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Details about the {site.name} mining operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {site.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Location</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Latitude: {site.location.latitude}, Longitude: {site.location.longitude}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Monitoring Status</h4>
                <p className="text-sm mt-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    site.activeMonitoring 
                      ? "bg-alert-low/10 text-alert-low" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {site.activeMonitoring ? "Active Monitoring" : "Monitoring Inactive"}
                  </span>
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Environmental Thresholds</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded-md bg-muted">
                    <span className="text-xs font-medium">pH</span>
                    <p className="text-sm">
                      Min: {site.thresholds.pH.min}, Max: {site.thresholds.pH.max}
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted">
                    <span className="text-xs font-medium">Temperature</span>
                    <p className="text-sm">
                      Min: {site.thresholds.temperature.min}°C, Max: {site.thresholds.temperature.max}°C
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted">
                    <span className="text-xs font-medium">Dissolved Oxygen</span>
                    <p className="text-sm">
                      Min: {site.thresholds.dissolvedOxygen.min} mg/L
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted">
                    <span className="text-xs font-medium">Conductivity</span>
                    <p className="text-sm">
                      Max: {site.thresholds.conductivity.max} μS/cm
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted">
                    <span className="text-xs font-medium">Turbidity</span>
                    <p className="text-sm">
                      Max: {site.thresholds.turbidity.max} NTU
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
