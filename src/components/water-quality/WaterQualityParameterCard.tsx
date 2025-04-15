
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
}

export function WaterQualityParameterCard({
  title,
  data,
  parameter,
  unit = "",
  threshold,
}: WaterQualityParameterCardProps) {
  if (!data.length) return null;

  const latestValue = data[0][parameter];
  const previousValue = data[1]?.[parameter];
  const values = data.map(d => Number(d[parameter]));
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  
  const isNumber = typeof latestValue === "number";
  if (!isNumber) return null;

  const getStatusColor = (value: number) => {
    if (!threshold) return "text-primary";
    if (value < threshold.min || value > threshold.max) return "text-destructive";
    return "text-primary";
  };

  const getChangeIcon = () => {
    if (!previousValue || latestValue === previousValue) {
      return <MinusIcon className="h-4 w-4" />;
    }
    return latestValue > previousValue ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
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
            parameter={parameter as any}
            threshold={threshold}
          />
        </div>
      </CardContent>
    </Card>
  );
}
