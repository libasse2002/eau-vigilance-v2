
// User roles
export enum UserRole {
  ADMIN = "admin",
  SITE_AGENT = "site_agent",
  EXTERNAL_SUPERVISOR = "external_supervisor",
  INTERNAL_SUPERVISOR = "internal_supervisor",
  DIRECTOR = "director",
  PROFESSOR = "professor",
}

// Water quality data
export interface WaterQualityData {
  id: string;
  siteId: string;
  timestamp: Date;
  pH: number;
  temperature: number;
  dissolvedOxygen: number;
  conductivity: number;
  turbidity: number;
  // Adding new properties for detailed water quality data
  salinity: number;
  nitrates: number;
  nitrites: number;
  ammonium: number;
  phosphates: number;
  suspendedSolids: number; // MES
  fecalColiforms: number;
  eColi: number;
  pathogens: string;
  ibgn: number;
  lead: number;
  mercury: number;
  arsenic: number;
  cadmium: number;
  chromium: number;
  copper: number;
  zinc: number;
  hydrocarbons: number;
  organicSolvents: number;
  pesticides: number;
  location: {
    latitude: number;
    longitude: number;
  };
  collectedBy: string;
  status: "normal" | "warning" | "critical";
}

// Export WaterQualityDetailedData from waterQuality.ts
export * from './waterQuality';

// Alert
export interface Alert {
  id: string;
  dataId: string;
  type: "pH" | "temperature" | "dissolved_oxygen" | "conductivity" | "turbidity";
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  siteAccess: string[];
}

// Mining site
export interface MiningSite {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  activeMonitoring: boolean;
  thresholds: {
    pH: {
      min: number;
      max: number;
    };
    temperature: {
      min: number;
      max: number;
    };
    dissolvedOxygen: {
      min: number;
    };
    conductivity: {
      max: number;
    };
    turbidity: {
      max: number;
    };
  };
}
