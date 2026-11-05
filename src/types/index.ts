export type CivicCategory =
  | 'Roads & Footpaths'
  | 'Water Supply'
  | 'Electricity & Streetlights'
  | 'Solid Waste Management'
  | 'Drainage & Sanitation'
  | 'Public Safety & Hazards';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus =
  | 'Submitted'
  | 'Clustered'
  | 'Pending Approval'
  | 'Approved / Dispatched'
  | 'Work In Progress'
  | 'Resolved';

export type RegionZone =
  | 'All'
  | 'Central Metro - Ward 03'
  | 'North Zone - Ward 14'
  | 'South Suburb - GP 08'
  | 'East Industrial - Ward 21';

export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: CivicCategory;
  region: RegionZone;
  latitude: number;
  longitude: number;
  citizenName: string;
  citizenPhone: string;
  submittedAt: string;
  masterIncidentId: string;
  status: IncidentStatus;
  photoUrl?: string;
  distanceFromCentroid?: string;
  similarityScore?: string;
  notificationLog?: string;
}

export interface MasterIncident {
  id: string;
  title: string;
  category: CivicCategory;
  region: RegionZone;
  linkedReportsCount: number;
  confidence: string;
  priority: PriorityLevel;
  department: string;
  workOrderId: string;
  status: IncidentStatus;
  lat: number;
  lng: number;
  contractor: string;
  description: string;
  createdAt: string;
  estimatedBoM?: string;
  slaTargetHours?: number;
  slaRemainingHours?: number;
}

export interface AIAgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Deduplicating' | 'Scoring' | 'Routing' | 'Planning' | 'Broadcasting' | 'Idle';
  icon: string;
  color: string;
  description: string;
  lastAction: string;
  confidence: string;
  latency: string;
  totalDecisions: number;
  metricBadge: string;
}

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  agent: 'SYSTEM' | 'CLASSIFY_AGENT' | 'DEDUP_AGENT' | 'PRIORITY_AGENT' | 'ROUTER_AGENT' | 'PLANNER_AGENT' | 'NOTIFY_AGENT' | 'SIMULATION' | 'CITIZEN_INGEST';
  color: string;
  message: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'duplicate' | 'escalation' | 'approved' | 'resolved';
  read: boolean;
}
