
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/types";

export const useAlerts = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map the database fields to our TypeScript types
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
};
