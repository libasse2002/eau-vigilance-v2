
import { WaterQualityData } from "@/types";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Label
} from "recharts";

interface IBGNBarChartProps {
  data: WaterQualityData[];
  height?: number;
}

export function IBGNBarChart({ data, height = 400 }: IBGNBarChartProps) {
  if (!data.length) {
    return <div className="text-center p-4">No data available</div>;
  }
  
  // Sort data by timestamp (newest first)
  const sortedData = [...data]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Take only the 10 most recent samples

  // Format data for chart
  const chartData = sortedData.map(item => {
    const ibgnValue = typeof item.ibgn === 'number' ? item.ibgn : 0;
    
    // Determine water quality class based on IBGN score
    let qualityClass = "";
    let qualityColor = "";
    
    if (ibgnValue >= 17) {
      qualityClass = "Très bon";
      qualityColor = "#3b82f6"; // Blue
    } else if (ibgnValue >= 13) {
      qualityClass = "Bon";
      qualityColor = "#22c55e"; // Green
    } else if (ibgnValue >= 9) {
      qualityClass = "Moyen";
      qualityColor = "#eab308"; // Yellow
    } else if (ibgnValue >= 5) {
      qualityClass = "Médiocre";
      qualityColor = "#f97316"; // Orange
    } else {
      qualityClass = "Mauvais";
      qualityColor = "#ef4444"; // Red
    }
    
    return {
      date: new Date(item.timestamp).toLocaleDateString(),
      ibgn: ibgnValue,
      qualityClass,
      qualityColor,
      siteId: item.siteId
    };
  }).reverse(); // Reverse to show oldest to newest (left to right)
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{label}</p>
          <p style={{ color: data.qualityColor }}>
            Score IBGN: <span className="font-bold">{data.ibgn}</span>
          </p>
          <p style={{ color: data.qualityColor }}>
            Qualité: <span className="font-bold">{data.qualityClass}</span>
          </p>
          <p>Site: {data.siteId}</p>
        </div>
      );
    }
    return null;
  };
  
  // Quality threshold lines
  const qualityThresholds = [
    { value: 17, label: "Très bon", color: "#3b82f6" },
    { value: 13, label: "Bon", color: "#22c55e" },
    { value: 9, label: "Moyen", color: "#eab308" },
    { value: 5, label: "Médiocre", color: "#f97316" },
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Indice Biologique Global Normalisé (IBGN)</h3>
      
      <div style={{ height: height || 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[0, 20]} 
              label={{ value: 'Score IBGN', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Quality threshold reference lines */}
            {qualityThresholds.map((threshold, index) => (
              <ReferenceLine 
                key={index}
                y={threshold.value} 
                stroke={threshold.color}
                strokeDasharray="3 3"
              >
                <Label 
                  value={threshold.label} 
                  position="right" 
                  fill={threshold.color}
                />
              </ReferenceLine>
            ))}
            
            {/* IBGN Score bars */}
            <Bar 
              dataKey="ibgn" 
              name="Score IBGN" 
              fill="#8884d8"
              // Set bar color based on quality class
              isAnimationActive={false}
              shape={(props: any) => {
                return (
                  <rect
                    {...props}
                    fill={props.payload.qualityColor}
                    x={props.x}
                    y={props.y}
                    width={props.width}
                    height={props.height}
                    rx={4}
                    ry={4}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        {qualityThresholds.map((threshold, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1 rounded-sm" 
              style={{ backgroundColor: threshold.color }} 
            />
            <span>{threshold.label} (≥{threshold.value})</span>
          </div>
        ))}
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 rounded-sm bg-red-500" />
          <span>Mauvais (&lt;5)</span>
        </div>
      </div>
    </div>
  );
}
