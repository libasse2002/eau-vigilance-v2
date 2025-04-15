
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { WaterQualityChart } from "@/components/dashboard/WaterQualityChart";
import { miningSites, waterQualityData, alerts } from "@/data/mockData";
import { useState } from "react";
import { format } from "date-fns";
import { 
  ActivityIcon, 
  AlertTriangleIcon, 
  BellIcon, 
  CheckCircleIcon, 
  DropletIcon, 
  ThermometerIcon, 
  WavesIcon 
} from "lucide-react";
import { Alert, MiningSite } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedSite, setSelectedSite] = useState<string>(miningSites[0].id);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>(
    alerts
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  );
  
  // Get selected site data
  const site = miningSites.find(site => site.id === selectedSite) as MiningSite;
  
  // Filter water quality data for selected site
  const siteData = waterQualityData
    .filter(data => data.siteId === selectedSite)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Calculate stats
  const totalReadings = siteData.length;
  const normalReadings = siteData.filter(data => data.status === "normal").length;
  const warningReadings = siteData.filter(data => data.status === "warning").length;
  const criticalReadings = siteData.filter(data => data.status === "critical").length;
  
  const normalPercentage = Math.round((normalReadings / totalReadings) * 100);
  
  // Get latest reading
  const latestReading = siteData[0];
  
  const acknowledgeAlert = (alertId: string) => {
    setRecentAlerts(prevAlerts => 
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's the latest water quality data.
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Water Quality Status"
          value={`${normalPercentage}%`}
          icon={<DropletIcon className="h-4 w-4" />}
          description="Within normal parameters"
          trend={{
            value: 3.2,
            isPositive: true,
          }}
          variant={normalPercentage > 90 ? "success" : normalPercentage < 70 ? "alert" : "default"}
        />
        <StatCard
          title="Active Alerts"
          value={recentAlerts.length}
          icon={<BellIcon className="h-4 w-4" />}
          description="Requires attention"
          variant={recentAlerts.length > 0 ? "alert" : "success"}
        />
        <StatCard
          title="Readings Today"
          value={siteData.filter(d => 
            new Date(d.timestamp).toDateString() === new Date().toDateString()
          ).length}
          icon={<ActivityIcon className="h-4 w-4" />}
          description="Data points collected"
        />
        <StatCard
          title="Last Updated"
          value={format(new Date(latestReading.timestamp), "h:mm a")}
          icon={<CheckCircleIcon className="h-4 w-4" />}
          description={format(new Date(latestReading.timestamp), "MMM d, yyyy")}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Water Quality Trends</CardTitle>
              <CardDescription>
                Historical water quality parameters for {site.name}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ph">
              <TabsList className="mb-4">
                <TabsTrigger value="ph">pH</TabsTrigger>
                <TabsTrigger value="temperature">Temperature</TabsTrigger>
                <TabsTrigger value="dissolvedOxygen">Dissolved Oxygen</TabsTrigger>
                <TabsTrigger value="conductivity">Conductivity</TabsTrigger>
                <TabsTrigger value="turbidity">Turbidity</TabsTrigger>
              </TabsList>
              <TabsContent value="ph">
                <WaterQualityChart 
                  data={siteData} 
                  parameter="pH" 
                  color="#0ea5e9"
                  threshold={site.thresholds.pH} 
                />
              </TabsContent>
              <TabsContent value="temperature">
                <WaterQualityChart 
                  data={siteData} 
                  parameter="temperature" 
                  color="#f97316"
                  threshold={site.thresholds.temperature} 
                />
              </TabsContent>
              <TabsContent value="dissolvedOxygen">
                <WaterQualityChart 
                  data={siteData} 
                  parameter="dissolvedOxygen" 
                  color="#10b981"
                  threshold={{ min: site.thresholds.dissolvedOxygen.min }} 
                />
              </TabsContent>
              <TabsContent value="conductivity">
                <WaterQualityChart 
                  data={siteData} 
                  parameter="conductivity" 
                  color="#8b5cf6"
                  threshold={{ max: site.thresholds.conductivity.max }} 
                />
              </TabsContent>
              <TabsContent value="turbidity">
                <WaterQualityChart 
                  data={siteData} 
                  parameter="turbidity" 
                  color="#6b7280"
                  threshold={{ max: site.thresholds.turbidity.max }} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Recent Alerts</span>
              <AlertTriangleIcon className="h-4 w-4 text-alert-high" />
            </CardTitle>
            <CardDescription>
              Alerts requiring attention for {site.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsList alerts={recentAlerts} onAcknowledge={acknowledgeAlert} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Latest Measurements</CardTitle>
            <WavesIcon className="h-4 w-4 text-primary" />
          </div>
          <CardDescription>
            Most recent water quality readings for {site.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4">
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">pH</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.pH < site.thresholds.pH.min || latestReading.pH > site.thresholds.pH.max
                    ? "text-alert-high"
                    : ""
                }`}>
                  {latestReading.pH.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: {site.thresholds.pH.min}-{site.thresholds.pH.max}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">Temp</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.temperature < site.thresholds.temperature.min || 
                  latestReading.temperature > site.thresholds.temperature.max
                    ? "text-alert-high"
                    : ""
                }`}>
                  {latestReading.temperature.toFixed(1)}°C
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: {site.thresholds.temperature.min}-{site.thresholds.temperature.max}°C
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">DO</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.dissolvedOxygen < site.thresholds.dissolvedOxygen.min
                    ? "text-alert-high"
                    : ""
                }`}>
                  {latestReading.dissolvedOxygen.toFixed(1)} mg/L
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Min: {site.thresholds.dissolvedOxygen.min} mg/L
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">Conductivity</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.conductivity > site.thresholds.conductivity.max
                    ? "text-alert-high"
                    : ""
                }`}>
                  {latestReading.conductivity.toFixed(0)} μS/cm
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max: {site.thresholds.conductivity.max} μS/cm
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">Turbidity</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.turbidity > site.thresholds.turbidity.max
                    ? "text-alert-high"
                    : ""
                }`}>
                  {latestReading.turbidity.toFixed(1)} NTU
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max: {site.thresholds.turbidity.max} NTU
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-muted-foreground uppercase">Status</div>
                <div className={`text-xl font-semibold mt-1 ${
                  latestReading.status === "critical" 
                    ? "text-alert-high" 
                    : latestReading.status === "warning" 
                    ? "text-alert-medium"
                    : "text-alert-low"
                }`}>
                  {latestReading.status === "critical" 
                    ? "Critical" 
                    : latestReading.status === "warning" 
                    ? "Warning"
                    : "Normal"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Updated {format(new Date(latestReading.timestamp), "h:mm a")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
