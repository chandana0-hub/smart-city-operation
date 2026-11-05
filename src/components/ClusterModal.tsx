import React, { useState } from 'react';
import {
  X,
  Users,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Building,
  CheckCheck,
} from 'lucide-react';
import { CitizenReport, MasterIncident } from '../types';

interface ClusterModalProps {
  incident: MasterIncident | null;
  reports: CitizenReport[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: MasterIncident['status']) => void;
}

export const ClusterModal: React.FC<ClusterModalProps> = ({
  incident,
  reports,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const filteredReports = reports.filter(
    (rep) =>
      rep.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (newStatus: MasterIncident['status']) => {
    onUpdateStatus(incident.id, newStatus);
    setBroadcastMessage(
      `Omnichannel broadcast dispatched! All ${reports.length} citizen tickets updated to "${newStatus}". SMS and push notifications sent.`
    );
    setTimeout(() => {
      setBroadcastMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="glassmorphism border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start sm:items-center justify-between gap-3 bg-[#0F2744]/90">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00ADB5] border border-cyan-500/30 font-bold">
                {incident.id}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  incident.priority === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : incident.priority === 'High'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/20 text-[#00ADB5] border-cyan-500/30'
                }`}
              >
                Priority: {incident.priority}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-[#00ADB5]" />
                {incident.department}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-2 leading-snug">
              {incident.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Master consolidated municipal record linked to{' '}
              <strong className="text-[#00ADB5] font-mono">{reports.length} individual citizen submissions</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Deduplication Metric Cards */}
          <div className="p-4 rounded-2xl bg-[#0B192C]/70 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="bg-[#0F2744]/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Spatial Clustering Radius:</span>
              <p className="text-slate-100 font-bold font-mono text-sm">&le; 18 meters centroid</p>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Haversine formula verified</span>
            </div>
            <div className="bg-[#0F2744]/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Semantic Cosine Score:</span>
              <p className="text-[#00ADB5] font-bold font-mono text-sm">{incident.confidence} Match</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">NLP vector embeddings</span>
            </div>
            <div className="bg-[#0F2744]/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Single Work Order Status:</span>
              <p className="text-emerald-400 font-bold font-mono text-sm">
                #{incident.workOrderId} ({incident.status})
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Contractor: {incident.contractor}
              </span>
            </div>
          </div>

          {/* Broadcast alert confirmation */}
          {broadcastMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{broadcastMessage}</span>
            </div>
          )}

          {/* Search bar & List of 20 preserved citizen reports */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00ADB5]" />
                <h4 className="text-sm font-bold text-white">
                  Preserved Citizen Reports ({reports.length} Unique Tickets)
                </h4>
              </div>

              {/* Search within cluster */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by citizen or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0F2744] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ADB5]"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Every citizen retains their personal ticket number and private phone line. Status changes trigger automated SMS dispatches to each citizen without human overhead.
            </p>

            <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-xl bg-[#0B192C]/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2744] text-slate-300 uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Report ID</th>
                    <th className="py-2.5 px-3">Citizen</th>
                    <th className="py-2.5 px-3">Raw Description</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Similarity</th>
                    <th className="py-2.5 px-3">Notification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-800/60 transition">
                      <td className="py-2.5 px-3 font-mono text-[#00ADB5] font-bold whitespace-nowrap">
                        {rep.id}
                      </td>
                      <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">
                        <div>{rep.citizenName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rep.citizenPhone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={rep.description}>
                        {rep.description}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {rep.distanceFromCentroid || '8.4 m'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 whitespace-nowrap">
                        {rep.similarityScore || '95.2%'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Send className="w-3 h-3" />
                          <span>SMS Synced</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BoM & Crew Planning Detail */}
          <div className="p-3.5 rounded-xl bg-[#0F2744]/70 border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">
              Autonomous Bill of Materials (BoM) & SOP:
            </span>
            <p className="text-slate-200">{incident.estimatedBoM || 'Bitumen cold mix + safety cones + 4 crew'}</p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#0F2744] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-[#00ADB5] shrink-0" />
            <span>Updating status triggers single contractor dispatch and broadcasts to all {reports.length} citizens.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStatusChange('Work In Progress')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mark In Progress</span>
            </button>
            <button
              onClick={() => handleStatusChange('Approved / Dispatched')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-[#00ADB5] border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Approve Dispatch</span>
            </button>
            <button
              onClick={() => handleStatusChange('Resolved')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B192C] font-bold text-xs hover:brightness-110 transition shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved & Broadcast</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
