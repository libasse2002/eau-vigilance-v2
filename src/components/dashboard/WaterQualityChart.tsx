
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
  ReferenceLine,
  Line,
  ComposedChart,
} from "recharts";

interface WaterQualityChartProps {
  data: WaterQualityData[];
  parameter: keyof WaterQualityData;
  color?: string;
  threshold?: {
    min?: number;
    max?: number;
  };
  secondaryParameter?: keyof WaterQualityData;
  secondaryColor?: string;
}

export function WaterQualityChart({
  data,
  parameter,
  color = "#0ea5e9",
  threshold,
  secondaryParameter,
  secondaryColor = "#ef4444",
}: WaterQualityChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map data to chart format with numeric values
  const chartData = sortedData.map((item) => {
    const value = typeof item[parameter] === 'number' ? 
      item[parameter] as number : 
      0;
    
    const secondaryValue = secondaryParameter && typeof item[secondaryParameter] === 'number' ? 
      item[secondaryParameter] as number : 
      undefined;
      
    return {
      date: format(new Date(item.timestamp), "MMM d"),
      value,
      secondaryValue,
      status: item.status,
    };
  });

  // Get parameter label
  const parameterLabels: Record<string, string> = {
    pH: "pH",
    temperature: "Température (°C)",
    dissolvedOxygen: "Oxygène Dissous (mg/L)",
    conductivity: "Conductivité (μS/cm)",
    turbidity: "Turbidité (NTU)",
    nitrates: "Nitrates (mg/L)",
    fecalColiforms: "Coliformes Fécaux (CFU/100mL)",
    eColi: "E. coli (CFU/100mL)",
    ibgn: "IBGN Score",
    lead: "Lead (μg/L)",
    mercury: "Mercure (μg/L)",
    arsenic: "Arsenic (μg/L)",
    cadmium: "Cadmium (μg/L)",
    salinity: "Salinité (g/L)",
    nitrites: "Nitrites (mg/L)",
    ammonium: "Ammonium (mg/L)",
    phosphates: "Phosphates (mg/L)",
    suspendedSolids: "Suspended Solids (mg/L)",
    chromium: "Chromium (μg/L)",
    copper: "Copper (μg/L)",
    zinc: "Zinc (μg/L)",
    hydrocarbons: "Hydrocarbons (μg/L)",
    organicSolvents: "Organic Solvents (μg/L)",
    pesticides: "Pesticides (μg/L)",
  };

  // Calculate min and max values for the chart domain
  const values = chartData.map((d) => d.value).filter((v): v is number => typeof v === 'number');
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Set domain based on thresholds and actual values
  const domainMin = threshold?.min ? Math.min(threshold.min * 0.9, minValue) : Math.max(0, minValue * 0.9);
  const domainMax = threshold?.max ? Math.max(threshold.max * 1.1, maxValue) : maxValue * 1.1;

  // Use ComposedChart if we have a secondary parameter
  const ChartComponent = secondaryParameter ? ComposedChart : AreaChart;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`color-${parameter}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {secondaryParameter && (
            <linearGradient id={`color-${secondaryParameter}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
            </linearGradient>
          )}
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
          domain={[domainMin, domainMax]}
          label={{ value: parameterLabels[parameter as string] || parameter as string, angle: -90, position: 'insideLeft' }}
        />
        {secondaryParameter && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={secondaryColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: parameterLabels[secondaryParameter as string] || secondaryParameter as string, angle: 90, position: 'insideRight' }}
          />
        )}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Date
                      </span>
                      <span className="font-medium">{label}</span>
                    </div>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-xs font-medium" style={{ color: entry.color }}>
                          {entry.name}
                        </span>
                        <span className="font-medium" style={{ color: entry.color }}>
                          {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </span>
                      </div>
                    ))}
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
          name={parameterLabels[parameter as string] || parameter as string}
          stroke={color}
          fillOpacity={1}
          fill={`url(#color-${parameter})`}
        />
        {secondaryParameter && (
          <Line
            type="monotone"
            dataKey="secondaryValue"
            name={parameterLabels[secondaryParameter as string] || secondaryParameter as string}
            stroke={secondaryColor}
            yAxisId="right"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
        {threshold?.min && (
          <ReferenceLine
            y={threshold.min}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: `Min: ${threshold.min}`, position: 'insideBottomLeft' }}
          />
        )}
        {threshold?.max && (
          <ReferenceLine
            y={threshold.max}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: `Max: ${threshold.max}`, position: 'insideTopLeft' }}
          />
        )}
        {parameter === 'dissolvedOxygen' && (
          <>
            <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Excellent', position: 'insideTopLeft' }} />
            <ReferenceLine y={5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Good', position: 'insideTopLeft' }} />
            <ReferenceLine y={3} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Concerning', position: 'insideTopLeft' }} />
          </>
        )}
        <Legend />
      </ChartComponent>
    </ResponsiveContainer>
  );
}
