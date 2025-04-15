
export interface WaterQualityDetailedData {
  // Paramètres physico-chimiques
  temperature: number;
  pH: number;
  conductivity: number;
  dissolvedOxygen: number;
  turbidity: number;
  salinity: number;
  nitrates: number;
  nitrites: number;
  ammonium: number;
  phosphates: number;
  suspendedSolids: number; // MES

  // Paramètres biologiques
  fecalColiforms: number;
  eColi: number;
  pathogens: string;
  ibgn: number;

  // Métaux lourds
  lead: number;
  mercury: number;
  arsenic: number;
  cadmium: number;
  chromium: number;
  copper: number;
  zinc: number;

  // Autres paramètres chimiques
  hydrocarbons: number;
  organicSolvents: number;
  pesticides: number;
  
  // Métadonnées
  siteId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  collectedBy: string;
  notes: string;
  timestamp: Date;
}

export interface WaterQualityFormData extends Omit<WaterQualityDetailedData, 'timestamp' | 'collectedBy'> {}
