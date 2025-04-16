
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WaterQualityData } from "@/types";

export const useWaterQualityData = (siteId?: string) => {
  return useQuery({
    queryKey: ["waterQualityData", siteId],
    queryFn: async () => {
      let query = supabase
        .from("water_quality_data")
        .select("*");
      
      if (siteId && siteId !== "all") {
        query = query.eq("site_id", siteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as WaterQualityData[];
    },
  });
};
