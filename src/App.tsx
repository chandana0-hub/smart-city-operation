import React, { useState } from 'react';
import { Header } from './components/Header';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ClusterModal } from './components/ClusterModal';
import { LandingView } from './components/views/LandingView';
import { DashboardView } from './components/views/DashboardView';
import { CitizenView } from './components/views/CitizenView';
import { IncidentsView } from './components/views/IncidentsView';
import { AgentsView } from './components/views/AgentsView';
import { MapView } from './components/views/MapView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ArchitectureView } from './components/views/ArchitectureView';

import {
  INITIAL_MASTER_INCIDENTS,
  INITIAL_PRESERVED_REPORTS,
  INITIAL_CITIZEN_TRACKED,
  INITIAL_AI_AGENTS,
  INITIAL_TERMINAL_LOGS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';

import {
  CitizenReport,
  MasterIncident,
  RegionZone,
  TerminalLogEntry,
  SystemNotification,
} from './types';

import {
  getHaversineDistance,
  calculateTextSimilarity,
  calculateCompositeDeduplicationScore,
  mapCategoryToDepartment,
  estimateBoM,
  evaluatePriority,
} from './utils/geoUtils';

import { analyzeCitizenReportWithAI } from './services/geminiService';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeRegion, setActiveRegion] = useState<RegionZone>('Central Metro - Ward 03');

  // Core Data Stores
  const [masterIncidents, setMasterIncidents] = useState<MasterIncident[]>(INITIAL_MASTER_INCIDENTS);
  const [preservedReports, setPreservedReports] = useState<CitizenReport[]>(INITIAL_PRESERVED_REPORTS);
  const [citizenTrackedReports, setCitizenTrackedReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_TRACKED);
  const [aiAgents] = useState(INITIAL_AI_AGENTS);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>(INITIAL_TERMINAL_LOGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  // Modal State
  const [inspectingClusterId, setInspectingClusterId] = useState<string | null>(null);

  // Helper to add terminal log entries
  const addTerminalLog = (
    agent: TerminalLogEntry['agent'],
    color: string,
    message: string
  ) => {
    const time = new Date().toTimeString().split(' ')[0] + '.' + String(Date.now() % 1000).padStart(3, '0');
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: time,
        agent,
        color,
        message,
      },
    ]);
  };

  // Inspect Cluster Modal
  const handleInspectCluster = (incidentId: string) => {
    setInspectingClusterId(incidentId);
  };

  // Update Status of a Master Incident
  const handleUpdateStatus = (incidentId: string, newStatus: MasterIncident['status']) => {
    setMasterIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );

    // Update preserved reports status & broadcast
    setPreservedReports((prev) =>
      prev.map((rep) =>
        rep.masterIncidentId === incidentId
          ? {
              ...rep,
              status: newStatus,
              notificationLog: `SMS Sent: Master Incident ${incidentId} updated to "${newStatus}"`,
            }
          : rep
      )
    );

    // Update tracked reports
    setCitizenTrackedReports((prev) =>
      prev.map((rep) =>
        rep.masterIncidentId === incidentId ? { ...rep, status: newStatus } : rep
      )
    );

    // Emits to Agent Bus
    addTerminalLog(
      'ROUTER_AGENT',
      'text-blue-400',
      `Master Incident ${incidentId} transitioned to "${newStatus}". Contractor work package updated.`
    );
    addTerminalLog(
      'NOTIFY_AGENT',
      'text-emerald-400',
      `Broadcast queue executed: All linked citizens notified of status "${newStatus}" via SMS.`
    );

    // Notification Drawer alert
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Work Order Status Updated`,
        message: `Incident ${incidentId} updated to ${newStatus}. All reporting citizens synchronized.`,
        timeAgo: 'Just now',
        type: newStatus === 'Resolved' ? 'resolved' : 'approved',
        read: false,
      },
      ...prev,
    ]);
  };

  // Approve all master work orders
  const handleApproveAll = () => {
    setMasterIncidents((prev) =>
      prev.map((inc) => ({ ...inc, status: 'Approved / Dispatched' }))
    );
    addTerminalLog(
      'ROUTER_AGENT',
      'text-emerald-400',
      'BULK ACTION: Municipal commissioner approved all 4 active Master Work Orders for immediate crew deployment.'
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Bulk Approval Executed',
        message: 'All 4 Master Work Orders officially approved and dispatched to field contractors.',
        timeAgo: 'Just now',
        type: 'approved',
        read: false,
      },
      ...prev,
    ]);
  };

  // Citizen Complaint Submission Logic with Deduplication Engine & Gemini AI
  const handleSubmitReport = async (
    newReportData: Omit<
      CitizenReport,
      'id' | 'submittedAt' | 'masterIncidentId' | 'status' | 'distanceFromCentroid' | 'similarityScore' | 'notificationLog'
    >
  ) => {
    const reportId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    addTerminalLog(
      'CITIZEN_INGEST',
      'text-cyan-300',
      `Ingested raw payload "${newReportData.title}" from ${newReportData.citizenName} (${newReportData.region})`
    );

    // Run AI classification via Gemini (or local fallback)
    const aiAnalysis = await analyzeCitizenReportWithAI(
      newReportData.title,
      newReportData.description,
      newReportData.region
    );

    addTerminalLog(
      'CLASSIFY_AGENT',
      'text-cyan-400',
      `Zero-shot taxonomy: "${newReportData.title}" -> ${aiAnalysis.category} (Confidence: ${(aiAnalysis.confidence * 100).toFixed(1)}%)`
    );

    // Run Spatial-Semantic Deduplication against existing master incidents
    const CLUSTER_RADIUS_METERS = 50.0;
    const SIMILARITY_THRESHOLD = 0.35;

    let matchedIncident: MasterIncident | null = null;
    let highestConfidence = 0;
    let minDistance = 999;

    for (const incident of masterIncidents) {
      if (incident.category === aiAnalysis.category) {
        const dist = getHaversineDistance(
          newReportData.latitude,
          newReportData.longitude,
          incident.lat,
          incident.lng
        );

        if (dist <= CLUSTER_RADIUS_METERS) {
          const textSim = calculateTextSimilarity(newReportData.description, incident.title);
          const composite = calculateCompositeDeduplicationScore(dist, CLUSTER_RADIUS_METERS, textSim);

          if (composite > highestConfidence && textSim >= SIMILARITY_THRESHOLD) {
            highestConfidence = composite;
            matchedIncident = incident;
            minDistance = dist;
          }
        }
      }
    }

    if (matchedIncident) {
      // CASE A: DUPLICATE FOUND
      const confidenceStr = (highestConfidence * 100).toFixed(1) + '%';

      addTerminalLog(
        'DEDUP_AGENT',
        'text-emerald-400',
        `Spatial proximity match (${minDistance.toFixed(1)}m <= 50m). Text similarity matched. Clustered into Master Incident ${matchedIncident.id} (Confidence: ${confidenceStr}). Single work order preserved!`
      );

      // Increment count & elevate priority if volume spikes
      const newCount = matchedIncident.linkedReportsCount + 1;
      const newPriority = evaluatePriority(newCount, matchedIncident.category, matchedIncident.region);

      if (newPriority !== matchedIncident.priority) {
        addTerminalLog(
          'PRIORITY_AGENT',
          'text-amber-300',
          `Incident report density spike (${newCount} reports). Priority dynamically elevated from ${matchedIncident.priority} -> ${newPriority}.`
        );
      }

      setMasterIncidents((prev) =>
        prev.map((i) =>
          i.id === matchedIncident!.id
            ? {
                ...i,
                linkedReportsCount: newCount,
                priority: newPriority,
              }
            : i
        )
      );

      const preservedRep: CitizenReport = {
        ...newReportData,
        id: reportId,
        submittedAt: 'Just now',
        masterIncidentId: matchedIncident.id,
        status: 'Clustered',
        distanceFromCentroid: `${minDistance.toFixed(1)} m`,
        similarityScore: confidenceStr,
        notificationLog: `SMS Delivered: Consolidated into Master Work Order #${matchedIncident.workOrderId}`,
      };

      setPreservedReports((prev) => [preservedRep, ...prev]);
      setCitizenTrackedReports((prev) => [preservedRep, ...prev]);

      addTerminalLog(
        'NOTIFY_AGENT',
        'text-emerald-300',
        `SMS confirmation sent to ${newReportData.citizenName} (${newReportData.citizenPhone}). Subscribed to Master Incident ${matchedIncident.id}.`
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Report Consolidated by AI`,
          message: `Ticket ${reportId} merged into ${matchedIncident!.id} (${confidenceStr} confidence). Redundant dispatch averted!`,
          timeAgo: 'Just now',
          type: 'duplicate',
          read: false,
        },
        ...prev,
      ]);

      return {
        masterIncidentId: matchedIncident.id,
        isDuplicate: true,
        confidence: confidenceStr,
      };
    } else {
      // CASE B: NEW UNIQUE MASTER INCIDENT CREATED
      const newMasterId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newWorkOrderId = `WO-${Math.floor(4000 + Math.random() * 9000)}`;
      const department = mapCategoryToDepartment(aiAnalysis.category);
      const bom = estimateBoM(aiAnalysis.category);

      addTerminalLog(
        'DEDUP_AGENT',
        'text-slate-300',
        `No existing open incident within 50m radius of (${newReportData.latitude}, ${newReportData.longitude}). Generated Master Incident ${newMasterId}.`
      );

      addTerminalLog(
        'ROUTER_AGENT',
        'text-blue-400',
        `Zero-hop jurisdiction mapping: Dispatched payload to ${department}.`
      );

      addTerminalLog(
        'PLANNER_AGENT',
        'text-purple-400',
        `Compiled BoM (${bom}). Generated singular Work Order #${newWorkOrderId}.`
      );

      const newMaster: MasterIncident = {
        id: newMasterId,
        title: newReportData.title,
        category: aiAnalysis.category,
        region: newReportData.region,
        linkedReportsCount: 1,
        confidence: '100%',
        priority: aiAnalysis.priority,
        department,
        workOrderId: newWorkOrderId,
        status: 'Pending Approval',
        lat: newReportData.latitude,
        lng: newReportData.longitude,
        contractor: 'Pending Municipal Assignment',
        description: newReportData.description,
        createdAt: 'Just now',
        estimatedBoM: bom,
        slaTargetHours: 12,
        slaRemainingHours: 12,
      };

      setMasterIncidents((prev) => [newMaster, ...prev]);

      const newPreserved: CitizenReport = {
        ...newReportData,
        id: reportId,
        submittedAt: 'Just now',
        masterIncidentId: newMasterId,
        status: 'Submitted',
        distanceFromCentroid: '0.0 m (Centroid)',
        similarityScore: '100%',
        notificationLog: `SMS Delivered: Created Master Work Order #${newWorkOrderId}`,
      };

      setPreservedReports((prev) => [newPreserved, ...prev]);
      setCitizenTrackedReports((prev) => [newPreserved, ...prev]);

      return {
        masterIncidentId: newMasterId,
        isDuplicate: false,
        confidence: '100%',
      };
    }
  };

  // Simulate Incoming Flood of 20 Pothole Reports
  const handleSimulateFlood = () => {
    setCurrentView('agents');
    addTerminalLog(
      'SIMULATION',
      'text-rose-400 font-bold',
      '⚡ SIMULATION INITIATED: 20 simultaneous citizens filing reports for MG Road Pothole near Pillar 142...'
    );

    setTimeout(() => {
      addTerminalLog(
        'CLASSIFY_AGENT',
        'text-cyan-400',
        'Classified 20 incoming payloads -> Category: "Roads & Footpaths"'
      );
    }, 400);

    setTimeout(() => {
      addTerminalLog(
        'DEDUP_AGENT',
        'text-[#00F2FE]',
        'Spatial R-Tree query: 20 reports within 18m centroid radius of (12.9716, 77.5946).'
      );
      addTerminalLog(
        'DEDUP_AGENT',
        'text-emerald-400 font-bold',
        'Cosine text embeddings matched (0.948). All 20 tickets clustered into Master Incident INC-2026-0841. 19 duplicate dispatches averted!'
      );
    }, 900);

    setTimeout(() => {
      addTerminalLog(
        'PRIORITY_AGENT',
        'text-rose-400 font-bold',
        'Velocity threshold exceeded (>15 complaints/hr). Escalated SLA to CRITICAL (4 hours).'
      );
      addTerminalLog(
        'NOTIFY_AGENT',
        'text-emerald-300',
        'Broadcast bus dispatched: 20 personalized SMS messages sent to all reporting citizens.'
      );
    }, 1500);
  };

  const currentInspectingIncident =
    masterIncidents.find((i) => i.id === inspectingClusterId) || masterIncidents[0];
  const currentInspectingReports = preservedReports.filter(
    (r) => r.masterIncidentId === inspectingClusterId
  );

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-100 flex flex-col font-sans selection:bg-[#00ADB5] selection:text-[#0B192C]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          const next = !isAdmin;
          setIsAdmin(next);
          setCurrentView(next ? 'dashboard' : 'citizen');
        }}
        activeRegion={activeRegion}
        onRegionChange={(reg) => setActiveRegion(reg)}
        unreadCount={notifications.filter((n) => !n.read).length}
        onToggleNotifications={() => setIsNotifOpen(!isNotifOpen)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        {currentView === 'landing' && (
          <LandingView
            onNavigate={(v) => setCurrentView(v)}
            onSimulateFlood={handleSimulateFlood}
          />
        )}

        {currentView === 'citizen' && (
          <CitizenView
            onSubmitReport={handleSubmitReport}
            trackedReports={citizenTrackedReports}
            onInspectMaster={handleInspectCluster}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            incidents={masterIncidents}
            onInspectCluster={handleInspectCluster}
            onSimulateFlood={handleSimulateFlood}
            onNavigate={(v) => setCurrentView(v)}
            activeRegion={activeRegion}
          />
        )}

        {currentView === 'incidents' && (
          <IncidentsView
            incidents={masterIncidents}
            onInspectCluster={handleInspectCluster}
            onApproveAll={handleApproveAll}
          />
        )}

        {currentView === 'agents' && (
          <AgentsView
            agents={aiAgents}
            terminalLogs={terminalLogs}
            onClearLogs={() => setTerminalLogs([])}
          />
        )}

        {currentView === 'map' && (
          <MapView
            incidents={masterIncidents}
            onInspectCluster={handleInspectCluster}
            activeRegion={activeRegion}
            onRegionChange={(reg) => setActiveRegion(reg)}
          />
        )}

        {currentView === 'analytics' && <AnalyticsView />}

        {currentView === 'architecture' && <ArchitectureView />}
      </main>

      {/* Cluster Inspection Modal */}
      <ClusterModal
        incident={currentInspectingIncident}
        reports={currentInspectingReports.length > 0 ? currentInspectingReports : INITIAL_PRESERVED_REPORTS}
        isOpen={inspectingClusterId !== null}
        onClose={() => setInspectingClusterId(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0F2744]/70 py-4 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00ADB5]" />
            <span className="font-semibold text-slate-300">
              CivicFlow AI &bull; Agentic Civic Operations System
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              6 Agents Active
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Autonomous Deduplication & GIS Engine</span>
            <button
              onClick={() => setCurrentView('architecture')}
              className="text-[#00ADB5] hover:underline"
            >
              Wix Velo Architecture
            </button>
            <span className="text-slate-500">v2.4 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
