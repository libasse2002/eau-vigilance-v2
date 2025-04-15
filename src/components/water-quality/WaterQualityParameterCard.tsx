
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterQualityData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { WaterQualityChart } from "@/components/dashboard/WaterQualityChart";

interface WaterQualityParameterCardProps {
  title: string;
  data: WaterQualityData[];
  parameter: keyof WaterQualityData;
  unit?: string;
  threshold?: {
    min: number;
    max: number;
  };
  secondaryParameter?: keyof WaterQualityData;
  secondaryUnit?: string;
}

export function WaterQualityParameterCard({
  title,
  data,
  parameter,
  unit = "",
  threshold,
  secondaryParameter,
  secondaryUnit,
}: WaterQualityParameterCardProps) {
  if (!data.length) return null;

  // Ensure we're working with numeric values
  const latestValue = typeof data[0][parameter] === 'number' ? 
    data[0][parameter] as number : 0;
    
  const previousValue = data[1] && typeof data[1][parameter] === 'number' ? 
    data[1][parameter] as number : null;
    
  // Filter out any non-numeric values
  const values = data
    .map(d => d[parameter])
    .filter((value): value is number => typeof value === 'number');
    
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  
  const getStatusColor = (value: number) => {
    if (!threshold) return "text-primary";
    if (value < threshold.min || value > threshold.max) return "text-destructive";
    return "text-primary";
  };

  const getChangeIcon = () => {
    if (previousValue === null || latestValue === previousValue) {
      return <MinusIcon className="h-4 w-4" />;
    }
    return latestValue > previousValue ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  // Get custom color based on parameter
  const getParameterColor = () => {
    switch (parameter) {
      case 'temperature': return "#ef4444"; // Red for temperature
      case 'pH': return "#3b82f6"; // Blue for pH
      case 'dissolvedOxygen': return "#22c55e"; // Green for DO
      case 'conductivity': return "#f59e0b"; // Amber for conductivity
      case 'turbidity': return "#92400e"; // Brown for turbidity
      case 'lead':
      case 'mercury':
      case 'arsenic':
      case 'cadmium': 
      case 'chromium':
      case 'copper':
      case 'zinc': return "#7c3aed"; // Purple for metals
      default: return "#0ea5e9"; // Default blue
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-2xl font-bold ${getStatusColor(latestValue)}`}>
              {latestValue.toFixed(2)} {unit}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getChangeIcon()}
              <span>vs previous</span>
            </div>
          </div>
          {threshold && (
            <div className="text-right text-xs text-muted-foreground">
              <div>Min: {threshold.min} {unit}</div>
              <div>Max: {threshold.max} {unit}</div>
            </div>
          )}
        </div>
        <div className="h-[100px] mt-4">
          <WaterQualityChart
            data={data.slice(0, 10)}
            parameter={parameter}
            color={getParameterColor()}
            threshold={threshold}
            secondaryParameter={secondaryParameter}
          />
        </div>
      </CardContent>
    </Card>
  );
}
