
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
      
      // Map the database fields to our TypeScript types
      return data.map(item => ({
        id: item.id,
        siteId: item.site_id,
        timestamp: new Date(item.timestamp),
        pH: item.ph || 0,
        temperature: item.temperature || 0,
        dissolvedOxygen: item.dissolved_oxygen || 0,
        conductivity: item.conductivity || 0,
        turbidity: item.turbidity || 0,
        salinity: item.salinity || 0,
        nitrates: item.nitrates || 0,
        nitrites: item.nitrites || 0,
        ammonium: item.ammonium || 0,
        phosphates: item.phosphates || 0,
        suspendedSolids: item.suspended_solids || 0,
        fecalColiforms: item.fecal_coliforms || 0,
        eColi: item.e_coli || 0,
        pathogens: item.pathogens || "",
        ibgn: item.ibgn || 0,
        lead: item.lead || 0,
        mercury: item.mercury || 0,
        arsenic: item.arsenic || 0,
        cadmium: item.cadmium || 0,
        chromium: item.chromium || 0,
        copper: item.copper || 0,
        zinc: item.zinc || 0,
        hydrocarbons: item.hydrocarbons || 0,
        organicSolvents: item.organic_solvents || 0,
        pesticides: item.pesticides || 0,
        location: {
          latitude: item.latitude,
          longitude: item.longitude
        },
        collectedBy: item.collected_by,
        status: item.status as "normal" | "warning" | "critical"
      })) as WaterQualityData[];
    },
  });
};
