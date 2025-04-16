
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MiningSite } from "@/types";

export const useSites = () => {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mining_sites")
        .select("*");
      
      if (error) throw error;
      return data as MiningSite[];
    },
  });
};
