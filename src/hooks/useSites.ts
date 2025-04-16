
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MiningSite } from "@/types";

export const useSites = () => {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mining_sites")
        .select("*, thresholds(*)");
      
      if (error) throw error;
      
      // Map the database fields to our TypeScript types
      return data.map(site => ({
        id: site.id,
        name: site.name,
        location: {
          latitude: site.latitude,
          longitude: site.longitude
        },
        description: site.description || "",
        activeMonitoring: site.active_monitoring || false,
        thresholds: {
          pH: {
            min: 6.5,
            max: 8.5
          },
          temperature: {
            min: 10,
            max: 30
          },
          dissolvedOxygen: {
            min: 5
          },
          conductivity: {
            max: 1500
          },
          turbidity: {
            max: 10
          }
        }
      })) as MiningSite[];
    },
  });
};
