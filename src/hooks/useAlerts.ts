
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useAlerts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(alert => ({
        id: alert.id,
        dataId: alert.data_id,
        type: alert.type as "pH" | "temperature" | "dissolved_oxygen" | "conductivity" | "turbidity",
        severity: alert.severity as "low" | "medium" | "high",
        message: alert.message,
        timestamp: new Date(alert.created_at),
        acknowledged: alert.acknowledged || false,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at ? new Date(alert.acknowledged_at) : undefined
      })) as Alert[];
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("alerts")
        .update({ 
          acknowledged: true, 
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert acknowledged",
        description: "The alert has been successfully acknowledged.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
      console.error("Error acknowledging alert:", error);
    },
  });

  return {
    data,
    isLoading,
    error,
    acknowledgeAlert: acknowledgeMutation.mutate
  };
};
