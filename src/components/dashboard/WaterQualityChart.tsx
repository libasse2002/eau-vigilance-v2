
import { WaterQualityData } from "@/types";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WaterQualityChartProps {
  data: WaterQualityData[];
  parameter: keyof WaterQualityData;
  color?: string;
  threshold?: {
    min?: number;
    max?: number;
  };
}

export function WaterQualityChart({
  data,
  parameter,
  color = "#0ea5e9",
  threshold,
}: WaterQualityChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map data to chart format
  const chartData = sortedData.map((item) => ({
    date: format(new Date(item.timestamp), "MMM d"),
    value: item[parameter],
    status: item.status,
  }));

  // Get parameter label
  const parameterLabels: Record<string, string> = {
    pH: "pH",
    temperature: "Temperature (°C)",
    dissolvedOxygen: "Dissolved Oxygen (mg/L)",
    conductivity: "Conductivity (μS/cm)",
    turbidity: "Turbidity (NTU)",
    nitrates: "Nitrates (mg/L)",
    fecalColiforms: "Fecal Coliforms (CFU/100mL)",
    eColi: "E. coli (CFU/100mL)",
    ibgn: "IBGN Score",
    lead: "Lead (μg/L)",
    mercury: "Mercury (μg/L)",
    arsenic: "Arsenic (μg/L)",
    cadmium: "Cadmium (μg/L)",
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`color-${parameter}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          domain={
            threshold
              ? [
                  threshold.min ? Math.min(threshold.min * 0.9, Math.min(...chartData.map((d) => d.value))) : "auto",
                  threshold.max ? Math.max(threshold.max * 1.1, Math.max(...chartData.map((d) => d.value))) : "auto",
                ]
              : ["auto", "auto"]
          }
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0];
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Date
                      </span>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        {parameterLabels[parameter as string] || parameter}
                      </span>
                      <span className="font-medium">{typeof data.value === 'number' ? data.value.toFixed(2) : data.value}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fillOpacity={1}
          fill={`url(#color-${parameter})`}
        />
        {threshold?.min && (
          <Area
            type="monotone"
            dataKey={() => threshold.min}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth={2}
            fillOpacity={0}
          />
        )}
        {threshold?.max && (
          <Area
            type="monotone"
            dataKey={() => threshold.max}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth={2}
            fillOpacity={0}
          />
        )}
        <Legend />
      </AreaChart>
    </ResponsiveContainer>
  );
}
