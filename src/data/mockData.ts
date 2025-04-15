
import { Alert, MiningSite, User, UserRole, WaterQualityData } from "@/types";

// Users mock data
export const users: User[] = [
  {
    id: "user-1",
    name: "Admin User",
    email: "admin@eau-vigilance.com",
    role: UserRole.ADMIN,
    avatar: "/avatars/admin.png",
    siteAccess: ["site-1", "site-2", "site-3"],
  },
  {
    id: "user-2",
    name: "Site Agent",
    email: "agent@eau-vigilance.com",
    role: UserRole.SITE_AGENT,
    avatar: "/avatars/agent.png",
    siteAccess: ["site-1"],
  },
  {
    id: "user-3",
    name: "External Supervisor",
    email: "external@eau-vigilance.com",
    role: UserRole.EXTERNAL_SUPERVISOR,
    avatar: "/avatars/supervisor.png",
    siteAccess: ["site-1", "site-2"],
  },
  {
    id: "user-4",
    name: "Internal Supervisor",
    email: "internal@eau-vigilance.com",
    role: UserRole.INTERNAL_SUPERVISOR,
    avatar: "/avatars/supervisor2.png",
    siteAccess: ["site-1", "site-2", "site-3"],
  },
  {
    id: "user-5",
    name: "Director DREEC",
    email: "director@eau-vigilance.com",
    role: UserRole.DIRECTOR,
    avatar: "/avatars/director.png",
    siteAccess: ["site-1", "site-2", "site-3"],
  },
  {
    id: "user-6",
    name: "Professor DGAE",
    email: "professor@eau-vigilance.com",
    role: UserRole.PROFESSOR,
    avatar: "/avatars/professor.png",
    siteAccess: ["site-1", "site-2"],
  },
];

// Mining sites mock data
export const miningSites: MiningSite[] = [
  {
    id: "site-1",
    name: "Kédougou Gold Mine",
    location: {
      latitude: 12.5503,
      longitude: -12.1726,
    },
    description: "Main gold mining operation in Kédougou region",
    activeMonitoring: true,
    thresholds: {
      pH: {
        min: 6.5,
        max: 8.5,
      },
      temperature: {
        min: 10,
        max: 30,
      },
      dissolvedOxygen: {
        min: 5,
      },
      conductivity: {
        max: 800,
      },
      turbidity: {
        max: 5,
      },
    },
  },
  {
    id: "site-2",
    name: "Tambacounda Mine",
    location: {
      latitude: 13.7702,
      longitude: -13.6672,
    },
    description: "Secondary mining site with mixed ore extraction",
    activeMonitoring: true,
    thresholds: {
      pH: {
        min: 6.5,
        max: 8.5,
      },
      temperature: {
        min: 10,
        max: 30,
      },
      dissolvedOxygen: {
        min: 5,
      },
      conductivity: {
        max: 800,
      },
      turbidity: {
        max: 5,
      },
    },
  },
  {
    id: "site-3",
    name: "Saraya Extraction Site",
    location: {
      latitude: 12.8421,
      longitude: -11.7864,
    },
    description: "Newer extraction operation focusing on sustainable practices",
    activeMonitoring: false,
    thresholds: {
      pH: {
        min: 6.5,
        max: 8.5,
      },
      temperature: {
        min: 10,
        max: 30,
      },
      dissolvedOxygen: {
        min: 5,
      },
      conductivity: {
        max: 800,
      },
      turbidity: {
        max: 5,
      },
    },
  },
];

// Generate random water quality data for the past 30 days
const generatePastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const getRandomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const getRandomStatus = (value: number, threshold: { min?: number; max?: number }) => {
  if (threshold.min && value < threshold.min * 0.9) return "critical";
  if (threshold.max && value > threshold.max * 1.1) return "critical";
  if (threshold.min && value < threshold.min) return "warning";
  if (threshold.max && value > threshold.max) return "warning";
  return "normal";
};

// Generate water quality data
export const generateWaterQualityData = (): WaterQualityData[] => {
  const data: WaterQualityData[] = [];
  
  miningSites.forEach(site => {
    for (let i = 0; i < 30; i++) {
      const pH = getRandomInRange(5.5, 9.0);
      const temperature = getRandomInRange(8, 35);
      const dissolvedOxygen = getRandomInRange(3, 8);
      const conductivity = getRandomInRange(400, 1000);
      const turbidity = getRandomInRange(1, 8);
      const salinity = getRandomInRange(0.1, 2);
      const nitrates = getRandomInRange(0, 80);
      const nitrites = getRandomInRange(0, 1);
      const ammonium = getRandomInRange(0, 2);
      const phosphates = getRandomInRange(0, 1);
      const suspendedSolids = getRandomInRange(5, 50);
      const fecalColiforms = getRandomInRange(0, 2000);
      const eColi = getRandomInRange(0, 1000);
      const ibgn = getRandomInRange(0, 20);
      const lead = getRandomInRange(0, 20);
      const mercury = getRandomInRange(0, 5);
      const arsenic = getRandomInRange(0, 15);
      const cadmium = getRandomInRange(0, 10);
      const chromium = getRandomInRange(0, 50);
      const copper = getRandomInRange(0, 100);
      const zinc = getRandomInRange(0, 200);
      const hydrocarbons = getRandomInRange(0, 500);
      const organicSolvents = getRandomInRange(0, 100);
      const pesticides = getRandomInRange(0, 50);
      
      // Determine status based on thresholds
      let overallStatus: "normal" | "warning" | "critical" = "normal";
      
      const pHStatus = getRandomStatus(pH, site.thresholds.pH);
      const tempStatus = getRandomStatus(temperature, site.thresholds.temperature);
      const doStatus = getRandomStatus(dissolvedOxygen, { min: site.thresholds.dissolvedOxygen.min });
      const condStatus = getRandomStatus(conductivity, { max: site.thresholds.conductivity.max });
      const turbStatus = getRandomStatus(turbidity, { max: site.thresholds.turbidity.max });
      
      if ([pHStatus, tempStatus, doStatus, condStatus, turbStatus].includes("critical")) {
        overallStatus = "critical";
      } else if ([pHStatus, tempStatus, doStatus, condStatus, turbStatus].includes("warning")) {
        overallStatus = "warning";
      }
      
      data.push({
        id: `data-${site.id}-${i}`,
        siteId: site.id,
        timestamp: generatePastDate(i),
        pH,
        temperature,
        dissolvedOxygen,
        conductivity,
        turbidity,
        salinity,
        nitrates,
        nitrites,
        ammonium,
        phosphates,
        suspendedSolids,
        fecalColiforms,
        eColi,
        pathogens: Math.random() > 0.8 ? "Detected" : "None",
        ibgn,
        lead,
        mercury,
        arsenic,
        cadmium,
        chromium,
        copper,
        zinc,
        hydrocarbons,
        organicSolvents,
        pesticides,
        location: {
          latitude: site.location.latitude + getRandomInRange(-0.01, 0.01),
          longitude: site.location.longitude + getRandomInRange(-0.01, 0.01),
        },
        collectedBy: i % 2 === 0 ? "user-2" : "user-3",
        status: overallStatus,
      });
    }
  });
  
  return data;
};

export const waterQualityData = generateWaterQualityData();

// Generate alerts based on water quality data
export const generateAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  let alertId = 1;
  
  waterQualityData.forEach(data => {
    if (data.status === "warning" || data.status === "critical") {
      const severity = data.status === "critical" ? "high" : "medium";
      
      if (data.pH < 6.5 || data.pH > 8.5) {
        alerts.push({
          id: `alert-${alertId++}`,
          dataId: data.id,
          type: "pH",
          severity: severity,
          message: `pH level ${data.pH.toFixed(1)} is outside acceptable range (6.5-8.5)`,
          timestamp: data.timestamp,
          acknowledged: Math.random() > 0.7,
          ...(Math.random() > 0.7 && {
            acknowledgedBy: "user-2",
            acknowledgedAt: new Date(),
          }),
        });
      }
      
      if (data.temperature < 10 || data.temperature > 30) {
        alerts.push({
          id: `alert-${alertId++}`,
          dataId: data.id,
          type: "temperature",
          severity: severity,
          message: `Temperature ${data.temperature.toFixed(1)}°C is outside acceptable range (10-30°C)`,
          timestamp: data.timestamp,
          acknowledged: Math.random() > 0.7,
          ...(Math.random() > 0.7 && {
            acknowledgedBy: "user-3",
            acknowledgedAt: new Date(),
          }),
        });
      }
      
      if (data.dissolvedOxygen < 5) {
        alerts.push({
          id: `alert-${alertId++}`,
          dataId: data.id,
          type: "dissolved_oxygen",
          severity: severity,
          message: `Dissolved oxygen ${data.dissolvedOxygen.toFixed(1)} mg/L is below minimum (5 mg/L)`,
          timestamp: data.timestamp,
          acknowledged: Math.random() > 0.7,
          ...(Math.random() > 0.7 && {
            acknowledgedBy: "user-4",
            acknowledgedAt: new Date(),
          }),
        });
      }
      
      if (data.conductivity > 800) {
        alerts.push({
          id: `alert-${alertId++}`,
          dataId: data.id,
          type: "conductivity",
          severity: severity,
          message: `Conductivity ${data.conductivity.toFixed(0)} μS/cm exceeds maximum (800 μS/cm)`,
          timestamp: data.timestamp,
          acknowledged: Math.random() > 0.7,
          ...(Math.random() > 0.7 && {
            acknowledgedBy: "user-5",
            acknowledgedAt: new Date(),
          }),
        });
      }
      
      if (data.turbidity > 5) {
        alerts.push({
          id: `alert-${alertId++}`,
          dataId: data.id,
          type: "turbidity",
          severity: severity,
          message: `Turbidity ${data.turbidity.toFixed(1)} NTU exceeds maximum (5 NTU)`,
          timestamp: data.timestamp,
          acknowledged: Math.random() > 0.7,
          ...(Math.random() > 0.7 && {
            acknowledgedBy: "user-1",
            acknowledgedAt: new Date(),
          }),
        });
      }
    }
  });
  
  return alerts;
};

export const alerts = generateAlerts();
