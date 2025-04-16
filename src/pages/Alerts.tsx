
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert as AlertType } from "@/types";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { BellIcon, CheckIcon, FilterIcon, SortAscIcon, SortDescIcon } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlerts } from "@/hooks/useAlerts";
import { useSites } from "@/hooks/useSites";

export default function Alerts() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "acknowledged" | "unacknowledged">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const { data: alerts = [], isLoading: isAlertsLoading } = useAlerts();
  const { data: sites = [], isLoading: isSitesLoading } = useSites();
  
  // Loading state
  if (isAlertsLoading || isSitesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Filter alerts based on site, search, and status
  const filteredAlerts = alerts
    .filter(alert => {
      if (selectedSite === "all") return true;
      return alert.dataId.includes(selectedSite);
    })
    .filter(alert => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return alert.message.toLowerCase().includes(query);
    })
    .filter(alert => {
      if (statusFilter === "all") return true;
      if (statusFilter === "acknowledged") return alert.acknowledged;
      return !alert.acknowledged;
    })
    .filter(alert => {
      if (severityFilter === "all") return true;
      return alert.severity === severityFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
  
  // Group alerts by acknowledgment status
  const acknowledgedAlerts = filteredAlerts.filter(alert => alert.acknowledged);
  const unacknowledgedAlerts = filteredAlerts.filter(alert => !alert.acknowledged);
  
  // Group alerts by severity
  const criticalAlerts = filteredAlerts.filter(alert => alert.severity === "high");
  const warningAlerts = filteredAlerts.filter(alert => alert.severity === "medium");
  const lowAlerts = filteredAlerts.filter(alert => alert.severity === "low");
  
  // Mock acknowledge function
  const acknowledgeAlert = (alertId: string) => {
    // In a real app, this would call an API
    console.log(`Alert ${alertId} acknowledged`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">
              Monitor and manage water quality alerts
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button>
              <CheckIcon className="h-4 w-4 mr-2" />
              Acknowledge All
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="w-[150px]">
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
                
                <div className="w-[150px]">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-[150px]">
                  <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? (
                    <SortAscIcon className="h-4 w-4" />
                  ) : (
                    <SortDescIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-alert-high/5 border-alert-high/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Critical Alerts</span>
              <div className="bg-alert-high/10 text-alert-high h-8 w-8 rounded-full flex items-center justify-center">
                {criticalAlerts.length}
              </div>
            </CardTitle>
            <CardDescription>
              High severity alerts requiring immediate attention
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-alert-medium/5 border-alert-medium/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Warning Alerts</span>
              <div className="bg-alert-medium/10 text-alert-medium h-8 w-8 rounded-full flex items-center justify-center">
                {warningAlerts.length}
              </div>
            </CardTitle>
            <CardDescription>
              Medium severity alerts that need monitoring
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-alert-low/5 border-alert-low/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Low Alerts</span>
              <div className="bg-alert-low/10 text-alert-low h-8 w-8 rounded-full flex items-center justify-center">
                {lowAlerts.length}
              </div>
            </CardTitle>
            <CardDescription>
              Minor alerts that may require attention in the future
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <BellIcon className="h-5 w-5 mr-2 text-primary" />
            Alert Management
          </CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts found based on your filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Alerts <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{filteredAlerts.length}</span>
              </TabsTrigger>
              <TabsTrigger value="unacknowledged">
                Unacknowledged <span className="ml-1 rounded-full bg-alert-high/10 text-alert-high px-2 py-0.5 text-xs">{unacknowledgedAlerts.length}</span>
              </TabsTrigger>
              <TabsTrigger value="acknowledged">
                Acknowledged <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{acknowledgedAlerts.length}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <AlertsList alerts={filteredAlerts} onAcknowledge={acknowledgeAlert} />
            </TabsContent>
            
            <TabsContent value="unacknowledged">
              {unacknowledgedAlerts.length > 0 ? (
                <AlertsList alerts={unacknowledgedAlerts} onAcknowledge={acknowledgeAlert} />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <CheckIcon className="h-12 w-12 mb-2 text-alert-low" />
                  <h3 className="text-lg font-medium">All Clear</h3>
                  <p className="text-sm">No unacknowledged alerts at this time.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="acknowledged">
              {acknowledgedAlerts.length > 0 ? (
                <AlertsList alerts={acknowledgedAlerts} />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <BellIcon className="h-12 w-12 mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Acknowledged Alerts</h3>
                  <p className="text-sm">No alerts have been acknowledged yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
