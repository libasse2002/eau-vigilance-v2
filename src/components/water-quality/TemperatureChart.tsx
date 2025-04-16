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

interface TemperatureChartProps {
  data: WaterQualityData[];
  height?: number;
}

export function TemperatureChart({ data, height = 400 }: TemperatureChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map data to chart format
  const chartData = sortedData.map((item) => {
    return {
      date: format(new Date(item.timestamp), "dd MMM"),
      fullDate: format(new Date(item.timestamp), "dd MMM yyyy"),
      value: typeof item.temperature === 'number' ? item.temperature : 0,
      status: item.status,
      site: item.siteId,
    };
  });
  
  // Temperature thresholds
  const minThreshold = 10;
  const maxThreshold = 30;
  
  // Calculate domain
  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const domainMin = Math.min(minThreshold * 0.9, minValue * 0.9);
  const domainMax = Math.max(maxThreshold * 1.1, maxValue * 1.1);

  // Seasonal references (simplified example)
  const seasons = [
    { id: 'winter', name: 'Hiver', start: 'Jan', end: 'Mar', color: '#cae9ff', expected: [5, 15] },
    { id: 'spring', name: 'Printemps', start: 'Apr', end: 'Jun', color: '#dcf1da', expected: [12, 22] },
    { id: 'summer', name: 'Été', start: 'Jul', end: 'Sep', color: '#fff2cc', expected: [20, 30] },
    { id: 'fall', name: 'Automne', start: 'Oct', end: 'Dec', color: '#ffe6cc', expected: [10, 20] }
  ];

  // Mettre à jour la fonction pour retourner un objet de style
  const getTemperatureStyle = (temp: number) => {
    if (temp > maxThreshold || temp < minThreshold) {
      return { fill: "#ef4444" };
    }
    return { fill: "#3b82f6" };
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Évolution de la température</h3>
        <div className="flex items-center text-xs space-x-4">
          {seasons.map(season => (
            <div key={season.id} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm" 
                style={{ backgroundColor: season.color }} 
              />
              <span>{season.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: height || 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
              
              {/* Define patterns for anomalies */}
              <pattern id="anomalyPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#ef4444" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Seasonal background areas */}
            {seasons.map(season => (
              <ReferenceArea 
                key={season.id}
                x1={season.start} 
                x2={season.end} 
                fill={season.color} 
                fillOpacity={0.4} 
              />
            ))}

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
              label={{ value: "Température (°C)", angle: -90, position: 'insideLeft' }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-md">
                      <p className="font-medium">{data.fullDate}</p>
                      <p className="text-red-500">
                        Température: <span className="font-bold">{data.value.toFixed(1)}°C</span>
                      </p>
                      <p className="text-sm text-gray-500">Site: {data.site}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend />

            {/* Critical thresholds */}
            <ReferenceLine
              y={minThreshold}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{
                value: `Min: ${minThreshold}°C`,
                position: 'insideBottomLeft',
                fill: "#3b82f6",
                fontSize: 12
              }}
            />
            
            <ReferenceLine
              y={maxThreshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: `Max: ${maxThreshold}°C`,
                position: 'insideTopLeft',
                fill: "#ef4444",
                fontSize: 12
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              name="Température (°C)"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#temperatureGradient)"
              activeDot={{ 
                r: 6,
                ...getTemperatureStyle(chartData[0]?.value || 20),
                stroke: "#fff"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-b from-red-500 to-blue-500 mr-1 rounded-sm" />
          <span>Dégradé température</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-red-500 mr-1 rounded-sm" />
          <span>Seuil critique</span>
        </div>
      </div>
    </div>
  );
}
