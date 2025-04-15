
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
  height?: number;
}

export function MetalsRadarChart({ data, siteId, height = 400 }: MetalsRadarChartProps) {
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
      "Plomb": normalizedLead,
      "Mercure": normalizedMercury,
      "Arsenic": normalizedArsenic,
      "Cadmium": normalizedCadmium,
      "Chrome": normalizedChromium,
      "Cuivre": normalizedCopper,
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
  
  // Generate a unique color for each metal
  const metalColors = {
    "Plomb": "#7c3aed", // Purple
    "Mercure": "#ef4444", // Red
    "Arsenic": "#10b981", // Green
    "Cadmium": "#f59e0b", // Amber
    "Chrome": "#3b82f6", // Blue
    "Cuivre": "#8b5cf6", // Light purple
    "Zinc": "#06b6d4", // Cyan
  };
  
  // Custom tooltip to show both percentage and actual values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{data.site}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'site') return null;
            
            const rawValueKey = entry.dataKey === 'Plomb' ? 'leadRaw' :
                               entry.dataKey === 'Mercure' ? 'mercuryRaw' :
                               entry.dataKey === 'Arsenic' ? 'arsenicRaw' :
                               entry.dataKey === 'Cadmium' ? 'cadmiumRaw' :
                               entry.dataKey === 'Chrome' ? 'chromiumRaw' :
                               entry.dataKey === 'Cuivre' ? 'copperRaw' :
                               entry.dataKey === 'Zinc' ? 'zincRaw' : '';
            
            const rawValue = data[rawValueKey];
            const threshold = entry.dataKey === 'Plomb' ? thresholds.lead :
                             entry.dataKey === 'Mercure' ? thresholds.mercury :
                             entry.dataKey === 'Arsenic' ? thresholds.arsenic :
                             entry.dataKey === 'Cadmium' ? thresholds.cadmium :
                             entry.dataKey === 'Chrome' ? thresholds.chromium :
                             entry.dataKey === 'Cuivre' ? thresholds.copper :
                             entry.dataKey === 'Zinc' ? thresholds.zinc : 0;
            
            // Color based on percentage of threshold
            const percentValue = entry.value;
            let textColor = "#22c55e"; // Green
            if (percentValue > 100) textColor = "#ef4444"; // Red
            else if (percentValue > 75) textColor = "#f97316"; // Orange
            else if (percentValue > 50) textColor = "#eab308"; // Yellow
            
            return (
              <p key={index} style={{ color: textColor }}>
                {entry.name}: <span className="font-semibold">{percentValue.toFixed(1)}%</span> 
                {typeof rawValue === 'number' && <span> ({rawValue.toFixed(2)} / {threshold} μg/L)</span>}
              </p>
            );
          })}
          <p className="text-xs text-gray-500 mt-1">% de la norme réglementaire</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Concentrations normalisées en métaux lourds</h3>
      
      <div style={{ height: height || 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="70%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="site" />
            <PolarRadiusAxis domain={[0, 150]} tickFormatter={(value) => `${value}%`} />
            
            {/* 100% threshold reference */}
            <Radar
              name="Seuil réglementaire"
              dataKey={() => 100}
              stroke="#ef4444"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            
            {/* Metal radars */}
            {Object.entries(metalColors).map(([metal, color]) => (
              <Radar
                key={metal}
                name={metal}
                dataKey={metal}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
              />
            ))}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 border border-red-500 border-dashed mr-1 rounded-sm" />
          <span>Seuil réglementaire (100%)</span>
        </div>
        {Object.entries(metalColors).map(([metal, color]) => (
          <div key={metal} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1 rounded-sm" 
              style={{ backgroundColor: color }} 
            />
            <span>{metal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
