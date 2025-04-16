import { WaterQualityData } from "@/types";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  Legend
} from "recharts";

interface PhChartProps {
  data: WaterQualityData[];
  height?: number;
}

export function PhChart({ data, height = 400 }: PhChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map data to chart format
  const chartData = sortedData.map((item) => {
    return {
      date: format(new Date(item.timestamp), "dd MMM"),
      fullDate: format(new Date(item.timestamp), "dd MMM yyyy"),
      value: typeof item.pH === 'number' ? item.pH : 0,
      status: item.status,
      site: item.siteId,
    };
  });
  
  // pH thresholds
  const minThreshold = 6.5;
  const maxThreshold = 8.5;
  
  // Calculate domain
  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const domainMin = Math.min(minValue * 0.9, 5);  // pH scale
  const domainMax = Math.max(maxValue * 1.1, 10); // pH scale

  // Mettre à jour la fonction getPhColor pour retourner un objet de style
  const getPhStyle = (ph: number) => {
    if (ph < 6) return { fill: "#ef4444" }; // Acidic - red
    if (ph >= 6 && ph < 6.5) return { fill: "#f97316" }; // Slightly acidic - orange
    if (ph >= 6.5 && ph <= 8.5) return { fill: "#22c55e" }; // Optimal - green
    if (ph > 8.5 && ph <= 9) return { fill: "#f97316" }; // Slightly alkaline - orange
    return { fill: "#3b82f6" }; // Alkaline - blue
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Évolution du pH</h3>
      
      <div style={{ height: height || 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[domainMin, domainMax]}
              label={{ value: "pH", angle: -90, position: 'insideLeft' }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const phValue = data.value;
                  const phColor = getPhStyle(phValue).fill;
                  
                  let phStatus = "Neutre";
                  if (phValue < 6) phStatus = "Acide";
                  else if (phValue < 6.5) phStatus = "Légèrement acide";
                  else if (phValue > 9) phStatus = "Très alcalin";
                  else if (phValue > 8.5) phStatus = "Légèrement alcalin";
                  
                  return (
                    <div className="bg-white p-3 border rounded shadow-md">
                      <p className="font-medium">{data.fullDate}</p>
                      <p style={{ color: phColor }}>
                        pH: <span className="font-bold">{phValue.toFixed(2)}</span>
                      </p>
                      <p style={{ color: phColor }}>
                        État: <span className="font-semibold">{phStatus}</span>
                      </p>
                      <p className="text-sm text-gray-500">Site: {data.site}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend />

            {/* Optimal pH zone */}
            <ReferenceArea 
              y1={minThreshold} 
              y2={maxThreshold} 
              fill="#22c55e" 
              fillOpacity={0.2} 
              label={{ 
                value: 'Zone optimale', 
                position: 'insideTopRight',
                fill: "#22c55e",
                fontSize: 12
              }} 
            />

            {/* Critical thresholds */}
            <ReferenceLine
              y={minThreshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: `Min: ${minThreshold}`,
                position: 'insideBottomLeft',
                fill: "#ef4444",
                fontSize: 12
              }}
            />
            
            <ReferenceLine
              y={maxThreshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: `Max: ${maxThreshold}`,
                position: 'insideTopLeft',
                fill: "#ef4444",
                fontSize: 12
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              name="pH"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#phGradient)"
              activeDot={{ 
                r: 6,
                ...getPhStyle(chartData[0]?.value || 7),
                stroke: "#fff"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm" />
          <span>Acide (pH &lt; 6.5)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm" />
          <span>Optimal (6.5-8.5)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm" />
          <span>Alcalin (pH &gt; 8.5)</span>
        </div>
      </div>
    </div>
  );
}
