
import { WaterQualityData } from "@/types";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface MetalsRadarChartProps {
  data: WaterQualityData[];
  siteId?: string;
}

export function MetalsRadarChart({ data, siteId }: MetalsRadarChartProps) {
  // Filter data by site if specified
  const filteredData = siteId 
    ? data.filter(d => d.siteId === siteId)
    : data;
  
  if (!filteredData.length) {
    return <div className="text-center p-4">No data available</div>;
  }
  
  // Get the latest data point for each site
  const latestDataBySite = new Map<string, WaterQualityData>();
  
  filteredData.forEach(dataPoint => {
    const existingData = latestDataBySite.get(dataPoint.siteId);
    if (!existingData || new Date(dataPoint.timestamp) > new Date(existingData.timestamp)) {
      latestDataBySite.set(dataPoint.siteId, dataPoint);
    }
  });
  
  // Normalize metals values relative to regulatory thresholds
  const thresholds = {
    lead: 10,       // μg/L
    mercury: 1,      // μg/L
    arsenic: 10,     // μg/L
    cadmium: 3,      // μg/L
    chromium: 50,    // μg/L
    copper: 100,     // μg/L
    zinc: 500,       // μg/L
  };
  
  // Prepare data for radar chart
  const radarData = Array.from(latestDataBySite.values()).map(data => {
    // Normalize each metal relative to its threshold (value/threshold * 100%)
    const normalizedLead = typeof data.lead === 'number' ? (data.lead / thresholds.lead) * 100 : 0;
    const normalizedMercury = typeof data.mercury === 'number' ? (data.mercury / thresholds.mercury) * 100 : 0;
    const normalizedArsenic = typeof data.arsenic === 'number' ? (data.arsenic / thresholds.arsenic) * 100 : 0;
    const normalizedCadmium = typeof data.cadmium === 'number' ? (data.cadmium / thresholds.cadmium) * 100 : 0;
    const normalizedChromium = typeof data.chromium === 'number' ? (data.chromium / thresholds.chromium) * 100 : 0;
    const normalizedCopper = typeof data.copper === 'number' ? (data.copper / thresholds.copper) * 100 : 0;
    const normalizedZinc = typeof data.zinc === 'number' ? (data.zinc / thresholds.zinc) * 100 : 0;
    
    return {
      site: data.siteId,
      "Lead": normalizedLead,
      "Mercury": normalizedMercury,
      "Arsenic": normalizedArsenic,
      "Cadmium": normalizedCadmium,
      "Chromium": normalizedChromium,
      "Copper": normalizedCopper,
      "Zinc": normalizedZinc,
      // Raw values for tooltip
      leadRaw: data.lead,
      mercuryRaw: data.mercury,
      arsenicRaw: data.arsenic,
      cadmiumRaw: data.cadmium,
      chromiumRaw: data.chromium,
      copperRaw: data.copper,
      zincRaw: data.zinc,
    };
  });
  
  // Generate a unique color for each site
  const siteColors = [
    "#7c3aed", // Purple
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Light purple
    "#06b6d4", // Cyan
  ];
  
  // Custom tooltip to show both percentage and actual values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{data.site}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'site') return null;
            
            const rawValueKey = entry.dataKey.toLowerCase() + 'Raw';
            const rawValue = data[rawValueKey];
            
            return (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value.toFixed(1)}% 
                {typeof rawValue === 'number' && ` (${rawValue.toFixed(2)} μg/L)`}
              </p>
            );
          })}
          <p className="text-xs text-gray-500 mt-1">% of regulatory threshold</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="site" />
          <PolarRadiusAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          
          {/* 100% threshold reference */}
          <Radar
            name="Regulatory Threshold"
            dataKey={() => 100}
            stroke="#ef4444"
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          
          {/* Metal radars */}
          <Radar
            name="Lead"
            dataKey="Lead"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.2}
          />
          <Radar
            name="Mercury"
            dataKey="Mercury"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
          <Radar
            name="Arsenic"
            dataKey="Arsenic"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
          <Radar
            name="Cadmium"
            dataKey="Cadmium"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.2}
          />
          <Radar
            name="Chromium"
            dataKey="Chromium"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.2}
          />
          <Radar
            name="Copper"
            dataKey="Copper"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
          />
          <Radar
            name="Zinc"
            dataKey="Zinc"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.2}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
