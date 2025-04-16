import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { WaterQualityChart } from "@/components/dashboard/WaterQualityChart";
import { useSites } from "@/hooks/useSites";
import { useWaterQualityData } from "@/hooks/useWaterQualityData";
import { useAlerts } from "@/hooks/useAlerts";
import { useState } from "react";
import { format } from "date-fns";
import { 
  ActivityIcon, 
  AlertTriangleIcon, 
  BellIcon, 
  CheckCircleIcon, 
  DropletIcon,
  Loader2Icon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: sites, isLoading: isSitesLoading } = useSites();
  const [selectedSite, setSelectedSite] = useState<string>(sites?.[0]?.id || "");
  const { data: waterQualityData, isLoading: isDataLoading } = useWaterQualityData(selectedSite);
  const { data: alerts, isLoading: isAlertsLoading } = useAlerts();

  // Afficher un loader pendant le chargement des données
  if (isDataLoading || isSitesLoading || isAlertsLoading) {
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
        <h2 className="text-2xl font-semibold">Bienvenue sur Eau Vigilance</h2>
        <p className="text-muted-foreground">
          Commencez par ajouter des données de qualité d'eau pour voir les statistiques.
        </p>
      </div>
    );
  }

  // Calculer les statistiques
  const totalReadings = waterQualityData.length;
  const normalReadings = waterQualityData.filter(data => data.status === "normal").length;
  const normalPercentage = Math.round((normalReadings / totalReadings) * 100);
  const latestReading = waterQualityData[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name || 'User'}! Here's the latest water quality data.
          </p>
        </div>
        
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select a site" />
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
          value={alerts?.length || 0}
          icon={<BellIcon className="h-4 w-4" />}
          description="Requires attention"
          variant={(alerts?.length || 0) > 0 ? "alert" : "success"}
        />
        <StatCard
          title="Readings Today"
          value={waterQualityData.filter(d => 
            new Date(d.timestamp).toDateString() === new Date().toDateString()
          ).length}
          icon={<ActivityIcon className="h-4 w-4" />}
          description="Data points collected"
        />
        <StatCard
          title="Last Updated"
          value={latestReading ? format(new Date(latestReading.timestamp), "h:mm a") : "N/A"}
          icon={<CheckCircleIcon className="h-4 w-4" />}
          description={latestReading ? format(new Date(latestReading.timestamp), "MMM d, yyyy") : "N/A"}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Water Quality Trends</CardTitle>
              <CardDescription>
                Historical water quality parameters for {sites?.find(site => site.id === selectedSite)?.name}
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
                  data={waterQualityData} 
                  parameter="pH" 
                  color="#0ea5e9"
                  threshold={sites?.find(site => site.id === selectedSite)?.thresholds.pH} 
                />
              </TabsContent>
              <TabsContent value="temperature">
                <WaterQualityChart 
                  data={waterQualityData} 
                  parameter="temperature" 
                  color="#f97316"
                  threshold={sites?.find(site => site.id === selectedSite)?.thresholds.temperature} 
                />
              </TabsContent>
              <TabsContent value="dissolvedOxygen">
                <WaterQualityChart 
                  data={waterQualityData} 
                  parameter="dissolvedOxygen" 
                  color="#10b981"
                  threshold={{ min: sites?.find(site => site.id === selectedSite)?.thresholds.dissolvedOxygen.min }} 
                />
              </TabsContent>
              <TabsContent value="conductivity">
                <WaterQualityChart 
                  data={waterQualityData} 
                  parameter="conductivity" 
                  color="#8b5cf6"
                  threshold={{ max: sites?.find(site => site.id === selectedSite)?.thresholds.conductivity.max }} 
                />
              </TabsContent>
              <TabsContent value="turbidity">
                <WaterQualityChart 
                  data={waterQualityData} 
                  parameter="turbidity" 
                  color="#6b7280"
                  threshold={{ max: sites?.find(site => site.id === selectedSite)?.thresholds.turbidity.max }} 
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
              Alerts requiring attention for {sites?.find(site => site.id === selectedSite)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsList alerts={alerts || []} onAcknowledge={() => {}} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Latest Measurements</CardTitle>
          </div>
          <CardDescription>
            Most recent water quality readings for {sites?.find(site => site.id === selectedSite)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestReading ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase">pH</div>
                  <div className={`text-xl font-semibold mt-1 ${
                    latestReading.pH < sites?.find(site => site.id === selectedSite)?.thresholds.pH.min || latestReading.pH > sites?.find(site => site.id === selectedSite)?.thresholds.pH.max
                      ? "text-alert-high"
                      : ""
                  }`}>
                    {latestReading.pH.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Range: {sites?.find(site => site.id === selectedSite)?.thresholds.pH.min}-{sites?.find(site => site.id === selectedSite)?.thresholds.pH.max}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Temp</div>
                  <div className={`text-xl font-semibold mt-1 ${
                    latestReading.temperature < sites?.find(site => site.id === selectedSite)?.thresholds.temperature.min || 
                    latestReading.temperature > sites?.find(site => site.id === selectedSite)?.thresholds.temperature.max
                      ? "text-alert-high"
                      : ""
                  }`}>
                    {latestReading.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Range: {sites?.find(site => site.id === selectedSite)?.thresholds.temperature.min}-{sites?.find(site => site.id === selectedSite)?.thresholds.temperature.max}°C
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase">DO</div>
                  <div className={`text-xl font-semibold mt-1 ${
                    latestReading.dissolvedOxygen < sites?.find(site => site.id === selectedSite)?.thresholds.dissolvedOxygen.min
                      ? "text-alert-high"
                      : ""
                  }`}>
                    {latestReading.dissolvedOxygen.toFixed(1)} mg/L
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Min: {sites?.find(site => site.id === selectedSite)?.thresholds.dissolvedOxygen.min} mg/L
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Conductivity</div>
                  <div className={`text-xl font-semibold mt-1 ${
                    latestReading.conductivity > sites?.find(site => site.id === selectedSite)?.thresholds.conductivity.max
                      ? "text-alert-high"
                      : ""
                  }`}>
                    {latestReading.conductivity.toFixed(0)} μS/cm
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Max: {sites?.find(site => site.id === selectedSite)?.thresholds.conductivity.max} μS/cm
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Turbidity</div>
                  <div className={`text-xl font-semibold mt-1 ${
                    latestReading.turbidity > sites?.find(site => site.id === selectedSite)?.thresholds.turbidity.max
                      ? "text-alert-high"
                      : ""
                  }`}>
                    {latestReading.turbidity.toFixed(1)} NTU
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Max: {sites?.find(site => site.id === selectedSite)?.thresholds.turbidity.max} NTU
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
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No data available for the selected site.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
