
import { WaterQualityData } from "@/types";
import { format } from "date-fns";
import {
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  Legend
} from "recharts";

interface DissolvedOxygenChartProps {
  data: WaterQualityData[];
  height?: number;
}

export function DissolvedOxygenChart({ data, height = 400 }: DissolvedOxygenChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map data to chart format
  const chartData = sortedData.map((item) => {
    return {
      date: format(new Date(item.timestamp), "dd MMM"),
      fullDate: format(new Date(item.timestamp), "dd MMM yyyy"),
      oxygen: typeof item.dissolvedOxygen === 'number' ? item.dissolvedOxygen : 0,
      temperature: typeof item.temperature === 'number' ? item.temperature : 0,
      status: item.status,
      site: item.siteId,
    };
  });
  
  // Oxygen thresholds and zones
  const zones = [
    { value: 7, label: "Excellent", color: "#22c55e" },
    { value: 5, label: "Bon", color: "#eab308" },
    { value: 3, label: "Préoccupant", color: "#f97316" },
  ];
  
  // Calculate domain
  const oxygenValues = chartData.map((d) => d.oxygen);
  const minOxygen = Math.min(...oxygenValues);
  const maxOxygen = Math.max(...oxygenValues);
  const domainMinOxygen = Math.min(minOxygen * 0.9, 0);
  const domainMaxOxygen = Math.max(maxOxygen * 1.1, 10);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Oxygène dissous et température</h3>
      
      <div style={{ height: height || 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="oxygenGradient" x1="0" y1="0" x2="0" y2="1">
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
              yAxisId="left"
              stroke="#22c55e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[domainMinOxygen, domainMaxOxygen]}
              label={{ value: "Oxygène dissous (mg/L)", angle: -90, position: 'insideLeft', fill: "#22c55e" }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#ef4444"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 40]}
              label={{ value: "Température (°C)", angle: 90, position: 'insideRight', fill: "#ef4444" }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  
                  // Determine oxygen quality
                  let oxygenQuality = "Critique";
                  let oxygenColor = "#ef4444";
                  
                  if (data.oxygen >= 7) {
                    oxygenQuality = "Excellent";
                    oxygenColor = "#22c55e";
                  } else if (data.oxygen >= 5) {
                    oxygenQuality = "Bon";
                    oxygenColor = "#eab308";
                  } else if (data.oxygen >= 3) {
                    oxygenQuality = "Préoccupant";
                    oxygenColor = "#f97316";
                  }
                  
                  return (
                    <div className="bg-white p-3 border rounded shadow-md">
                      <p className="font-medium">{data.fullDate}</p>
                      <p style={{ color: oxygenColor }}>
                        Oxygène: <span className="font-bold">{data.oxygen.toFixed(1)} mg/L</span>
                      </p>
                      <p style={{ color: oxygenColor }}>
                        Qualité: <span className="font-bold">{oxygenQuality}</span>
                      </p>
                      <p style={{ color: "#ef4444" }}>
                        Température: <span className="font-bold">{data.temperature.toFixed(1)}°C</span>
                      </p>
                      <p className="text-sm text-gray-500">Site: {data.site}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend />

            {/* Quality zones */}
            <ReferenceArea 
              yAxisId="left"
              y1={7} 
              y2={domainMaxOxygen} 
              fill="#22c55e" 
              fillOpacity={0.1} 
            />
            <ReferenceArea 
              yAxisId="left"
              y1={5} 
              y2={7} 
              fill="#eab308" 
              fillOpacity={0.1} 
            />
            <ReferenceArea 
              yAxisId="left"
              y1={3} 
              y2={5} 
              fill="#f97316" 
              fillOpacity={0.1} 
            />
            <ReferenceArea 
              yAxisId="left"
              y1={domainMinOxygen} 
              y2={3} 
              fill="#ef4444" 
              fillOpacity={0.1} 
            />

            {/* Threshold lines */}
            {zones.map((zone, index) => (
              <ReferenceLine
                key={index}
                yAxisId="left"
                y={zone.value}
                stroke={zone.color}
                strokeDasharray="3 3"
                label={{
                  value: `${zone.label} (${zone.value} mg/L)`,
                  position: 'insideLeft',
                  fill: zone.color,
                  fontSize: 12
                }}
              />
            ))}

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="oxygen"
              name="Oxygène dissous (mg/L)"
              stroke="#22c55e"
              fillOpacity={0.6}
              fill="url(#oxygenGradient)"
              activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              name="Température (°C)"
              stroke="#ef4444"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm" />
          <span>Excellent (&gt;7 mg/L)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 mr-1 rounded-sm" />
          <span>Bon (5-7 mg/L)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 mr-1 rounded-sm" />
          <span>Préoccupant (3-5 mg/L)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm" />
          <span>Critique (&lt;3 mg/L)</span>
        </div>
      </div>
    </div>
  );
}
