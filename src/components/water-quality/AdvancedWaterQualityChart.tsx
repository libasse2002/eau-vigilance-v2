
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
  ComposedChart,
  Line,
  Legend,
  Bar,
  BarChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

type ChartType = "line" | "bar" | "area" | "radar" | "composed";

interface AdvancedWaterQualityChartProps {
  data: WaterQualityData[];
  parameter: keyof WaterQualityData;
  title: string;
  chartType?: ChartType;
  color?: string;
  threshold?: {
    min?: number;
    max?: number;
    zones?: {
      value: number;
      label: string;
      color: string;
    }[];
  };
  secondaryParameter?: keyof WaterQualityData;
  secondaryColor?: string;
  logarithmic?: boolean;
  showSeasonalBackground?: boolean;
}

export function AdvancedWaterQualityChart({
  data,
  parameter,
  title,
  chartType = "area",
  color = "#0ea5e9",
  threshold,
  secondaryParameter,
  secondaryColor = "#ef4444",
  logarithmic = false,
  showSeasonalBackground = false,
}: AdvancedWaterQualityChartProps) {
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
      fullDate: format(new Date(item.timestamp), "yyyy-MM-dd"),
      value: logarithmic ? (value > 0 ? Math.log10(value) : 0) : value,
      rawValue: value, // Original value for display
      secondaryValue: secondaryValue,
      secondaryRawValue: secondaryValue, // Original value for display
      status: item.status,
      siteId: item.siteId,
      siteName: item.siteId,
    };
  });

  // Get parameter label
  const parameterLabels: Record<string, string> = {
    pH: "pH",
    temperature: "Temperature (°C)",
    dissolvedOxygen: "Dissolved Oxygen (mg/L)",
    conductivity: "Conductivity (μS/cm)",
    turbidity: "Turbidity (NTU)",
    nitrates: "Nitrates (mg/L)",
    nitrites: "Nitrites (mg/L)",
    ammonium: "Ammonium (mg/L)",
    fecalColiforms: logarithmic ? "Fecal Coliforms (log10 CFU/100mL)" : "Fecal Coliforms (CFU/100mL)",
    eColi: logarithmic ? "E. coli (log10 CFU/100mL)" : "E. coli (CFU/100mL)",
    ibgn: "IBGN Score",
    lead: "Lead (μg/L)",
    mercury: "Mercury (μg/L)",
    arsenic: "Arsenic (μg/L)",
    cadmium: "Cadmium (μg/L)",
    chromium: "Chromium (μg/L)",
    copper: "Copper (μg/L)",
    zinc: "Zinc (μg/L)",
    phosphates: "Phosphates (mg/L)",
    salinity: "Salinity (g/L)",
    suspendedSolids: "Suspended Solids (mg/L)",
    hydrocarbons: "Hydrocarbons (μg/L)",
    organicSolvents: "Organic Solvents (μg/L)",
    pesticides: "Pesticides (μg/L)",
  };

  // Calculate min and max values for the chart domain
  const values = chartData.map((d) => d.value).filter((v): v is number => typeof v === 'number');
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Set domain based on thresholds and actual values
  const domainMin = threshold?.min !== undefined 
    ? Math.min(logarithmic ? (threshold.min > 0 ? Math.log10(threshold.min) * 0.9 : 0) : threshold.min * 0.9, minValue) 
    : Math.max(0, minValue * 0.9);
  
  const domainMax = threshold?.max !== undefined 
    ? Math.max(logarithmic ? (threshold.max > 0 ? Math.log10(threshold.max) * 1.1 : 0) : threshold.max * 1.1, maxValue) 
    : maxValue * 1.1;

  // Choose appropriate chart component based on chartType
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
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
              label={{ value: parameterLabels[parameter as string] || parameter as string, angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => logarithmic ? Math.pow(10, value).toFixed(0) : value.toFixed(1)}
            />
            <Tooltip 
              formatter={(value, name) => {
                const idx = chartData.findIndex(d => d.value === value);
                const rawValue = idx >= 0 ? chartData[idx].rawValue : value;
                return [logarithmic ? Math.pow(10, Number(value)).toFixed(1) : Number(rawValue).toFixed(2), name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              name={parameterLabels[parameter as string] || parameter as string} 
              fill={color} 
              radius={[4, 4, 0, 0]}
            />
            {renderThresholds()}
          </BarChart>
        );
      
      case "radar":
        // For radar charts, transform data to be suitable for radar visualization
        const radarData = Array.from(new Set(chartData.map(d => d.siteId))).map(siteId => {
          const siteData = chartData.filter(d => d.siteId === siteId);
          const result: any = { site: siteId };
          
          // Calculate average for each parameter per site
          result[parameter as string] = siteData.reduce((sum, d) => sum + d.value, 0) / siteData.length;
          if (secondaryParameter) {
            result[secondaryParameter as string] = siteData.reduce((sum, d) => {
              const val = d.secondaryValue as number;
              return sum + (typeof val === 'number' ? val : 0);
            }, 0) / siteData.length;
          }
          
          return result;
        });
        
        return (
          <RadarChart 
            outerRadius={150} 
            width={600} 
            height={400} 
            data={radarData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="site" />
            <PolarRadiusAxis angle={30} domain={[0, domainMax]} />
            <Radar 
              name={parameterLabels[parameter as string] || parameter as string} 
              dataKey={parameter as string} 
              stroke={color} 
              fill={color} 
              fillOpacity={0.6} 
            />
            {secondaryParameter && (
              <Radar 
                name={parameterLabels[secondaryParameter as string] || secondaryParameter as string} 
                dataKey={secondaryParameter as string} 
                stroke={secondaryColor} 
                fill={secondaryColor} 
                fillOpacity={0.6} 
              />
            )}
            <Legend />
          </RadarChart>
        );
      
      case "composed":
        return (
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            {renderDefs()}
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
              label={{ value: parameterLabels[parameter as string] || parameter as string, angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => logarithmic ? Math.pow(10, value).toFixed(0) : value.toFixed(1)}
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
            <Tooltip 
              formatter={(value, name, props) => {
                if (name === parameterLabels[parameter as string] || name === parameter) {
                  return [logarithmic ? Math.pow(10, Number(value)).toFixed(1) : Number(value).toFixed(2), name];
                }
                if (secondaryParameter && (name === parameterLabels[secondaryParameter as string] || name === secondaryParameter)) {
                  const entryData = props.payload;
                  return [entryData.secondaryRawValue ? Number(entryData.secondaryRawValue).toFixed(2) : "-", name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name={parameterLabels[parameter as string] || parameter as string}
              stroke={color}
              fillOpacity={0.8}
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
            {renderThresholds()}
          </ComposedChart>
        );
      
      case "line":
      case "area":
      default:
        return (
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            {renderDefs()}
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
              label={{ value: parameterLabels[parameter as string] || parameter as string, angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => logarithmic ? Math.pow(10, value).toFixed(0) : value.toFixed(1)}
            />
            <Tooltip 
              formatter={(value) => {
                return [logarithmic ? Math.pow(10, Number(value)).toFixed(1) : Number(value).toFixed(2), parameterLabels[parameter as string] || parameter];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name={parameterLabels[parameter as string] || parameter as string}
              stroke={color}
              fillOpacity={0.8}
              fill={`url(#color-${parameter})`}
            />
            {renderThresholds()}
            {renderReferenceAreas()}
          </AreaChart>
        );
    }
  };

  // Render gradient definitions for chart coloring
  const renderDefs = () => (
    <defs>
      <linearGradient id={`color-${parameter}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
        <stop offset="95%" stopColor={color} stopOpacity={0} />
      </linearGradient>
      {parameter === "temperature" && (
        <linearGradient id="temperature-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      )}
      {parameter === "pH" && (
        <linearGradient id="ph-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
          <stop offset="50%" stopColor="#22c55e" stopOpacity={0.5} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
        </linearGradient>
      )}
    </defs>
  );

  // Render threshold lines
  const renderThresholds = () => {
    const elements = [];
    
    if (threshold?.min !== undefined) {
      const minY = logarithmic && threshold.min > 0 ? Math.log10(threshold.min) : threshold.min;
      elements.push(
        <ReferenceLine
          key="min-threshold"
          y={minY}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{ 
            value: `Min: ${threshold.min}`, 
            position: 'insideBottomLeft',
            fill: "#ef4444",
            fontSize: 12
          }}
        />
      );
    }
    
    if (threshold?.max !== undefined) {
      const maxY = logarithmic && threshold.max > 0 ? Math.log10(threshold.max) : threshold.max;
      elements.push(
        <ReferenceLine
          key="max-threshold"
          y={maxY}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{ 
            value: `Max: ${threshold.max}`, 
            position: 'insideTopLeft',
            fill: "#ef4444", 
            fontSize: 12
          }}
        />
      );
    }

    // Add zones if provided
    if (threshold?.zones && threshold.zones.length > 0) {
      threshold.zones.forEach((zone, index) => {
        const zoneY = logarithmic && zone.value > 0 ? Math.log10(zone.value) : zone.value;
        elements.push(
          <ReferenceLine
            key={`zone-${index}`}
            y={zoneY}
            stroke={zone.color}
            strokeDasharray="3 3"
            label={{ 
              value: zone.label, 
              position: 'insideTopLeft',
              fill: zone.color,
              fontSize: 12
            }}
          />
        );
      });
    }

    // Special case for dissolved oxygen
    if (parameter === 'dissolvedOxygen' && !threshold?.zones) {
      elements.push(
        <ReferenceLine 
          key="oxygen-excellent"
          y={7} 
          stroke="#22c55e" 
          strokeDasharray="3 3" 
          label={{ value: 'Excellent (7mg/L)', position: 'insideTopLeft', fill: "#22c55e", fontSize: 12 }} 
        />,
        <ReferenceLine 
          key="oxygen-good"
          y={5} 
          stroke="#eab308" 
          strokeDasharray="3 3" 
          label={{ value: 'Good (5mg/L)', position: 'insideTopLeft', fill: "#eab308", fontSize: 12 }} 
        />,
        <ReferenceLine 
          key="oxygen-concerning"
          y={3} 
          stroke="#f97316" 
          strokeDasharray="3 3" 
          label={{ value: 'Concerning (3mg/L)', position: 'insideTopLeft', fill: "#f97316", fontSize: 12 }} 
        />
      );
    }
    
    return elements;
  };

  // Render colored reference areas for ranges
  const renderReferenceAreas = () => {
    const elements = [];
    
    // Special case for pH optimal range
    if (parameter === 'pH') {
      elements.push(
        <ReferenceArea 
          key="ph-optimal"
          y1={6.5} 
          y2={8.5} 
          fill="#22c55e" 
          fillOpacity={0.1} 
          label={{ value: 'Optimal pH Range', position: 'insideTopLeft', fill: "#22c55e", fontSize: 12 }} 
        />
      );
    }
    
    // Special case for oxygen quality zones
    if (parameter === 'dissolvedOxygen') {
      elements.push(
        <ReferenceArea 
          key="oxygen-excellent"
          y1={7} 
          y2={domainMax} 
          fill="#22c55e" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="oxygen-good"
          y1={5} 
          y2={7} 
          fill="#eab308" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="oxygen-concerning"
          y1={3} 
          y2={5} 
          fill="#f97316" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="oxygen-critical"
          y1={domainMin} 
          y2={3} 
          fill="#ef4444" 
          fillOpacity={0.1} 
        />
      );
    }
    
    // Show seasonal background if requested (simplified example)
    if (showSeasonalBackground && parameter === 'temperature') {
      // This is a simplified example - in a real app, you would calculate 
      // seasonal patterns based on historical data
      elements.push(
        <ReferenceArea 
          key="seasonal-winter"
          x1="Jan" 
          x2="Mar" 
          fill="#3b82f6" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="seasonal-spring"
          x1="Apr" 
          x2="Jun" 
          fill="#22c55e" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="seasonal-summer"
          x1="Jul" 
          x2="Sep" 
          fill="#ef4444" 
          fillOpacity={0.1} 
        />,
        <ReferenceArea 
          key="seasonal-fall"
          x1="Oct" 
          x2="Dec" 
          fill="#eab308" 
          fillOpacity={0.1} 
        />
      );
    }
    
    return elements;
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
