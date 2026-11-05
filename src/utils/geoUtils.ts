import { CivicCategory, PriorityLevel } from '../types';

/**
 * Calculates Haversine distance in meters between two GPS coordinates
 */
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Word set intersection similarity (Jaccard Index)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const sanitize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const words1 = new Set(sanitize(text1));
  const words2 = new Set(sanitize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Composite Deduplication Score:
 * 60% spatial proximity weight (within maxRadius) + 40% semantic text similarity
 */
export function calculateCompositeDeduplicationScore(
  distanceMeters: number,
  maxRadiusMeters: number = 50.0,
  textSim: number
): number {
  if (distanceMeters > maxRadiusMeters) return 0;
  const spatialScore = Math.max(0, 1 - distanceMeters / maxRadiusMeters);
  return spatialScore * 0.6 + textSim * 0.4;
}

/**
 * Department Routing Rules
 */
export function mapCategoryToDepartment(category: CivicCategory): string {
  switch (category) {
    case 'Roads & Footpaths':
      return 'Roads & Infrastructure Maintenance Division';
    case 'Water Supply':
      return 'Water Supply & Sewerage Board';
    case 'Electricity & Streetlights':
      return 'Electrical & Power Utilities Division';
    case 'Solid Waste Management':
      return 'Solid Waste & Sanitation Directorate';
    case 'Drainage & Sanitation':
      return 'Stormwater & Drainage Engineering Dept';
    case 'Public Safety & Hazards':
      return 'Disaster Response & Urban Safety Force';
    default:
      return 'General Municipal Services';
  }
}

/**
 * Generates Standardized Bill of Materials (BoM)
 */
export function estimateBoM(category: CivicCategory): string {
  switch (category) {
    case 'Roads & Footpaths':
      return 'Bitumen Cold Mix 250kg + Compactor Roller + Road Safety Cones (Crew: 4)';
    case 'Water Supply':
      return 'High-Pressure Pipe Coupler 150mm + Valve Gaskets + Submersible Pump (Crew: 3)';
    case 'Electricity & Streetlights':
      return 'LED Driver Unit 120W + Heavy Insulated Cable 50m + Hydraulic Lift Truck (Crew: 2)';
    case 'Solid Waste Management':
      return 'Compactor Refuse Vehicle + Industrial Disinfectant Spray + 4 Bin Replacements (Crew: 3)';
    case 'Drainage & Sanitation':
      return 'Suction Jetting Tanker 5000L + Silt Extraction Augers + Safety Gas Detectors (Crew: 4)';
    case 'Public Safety & Hazards':
      return 'Hydraulic Chainsaw + Heavy Tow Winch + Perimeter Barricade System (Crew: 5)';
  }
}

/**
 * Dynamic Priority Assessment
 */
export function evaluatePriority(
  reportsCount: number,
  category: CivicCategory,
  region: string
): PriorityLevel {
  if (reportsCount >= 10) return 'Critical';
  if (category === 'Water Supply' || category === 'Public Safety & Hazards') {
    if (reportsCount >= 4) return 'Critical';
    return 'High';
  }
  if (region.includes('Central Metro') && reportsCount >= 4) return 'Critical';
  if (reportsCount >= 3) return 'High';
  return 'Medium';
}
