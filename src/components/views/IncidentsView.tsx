import React, { useState } from 'react';
import {
  Combine,
  CheckCheck,
  Cpu,
  Search,
  Filter,
  Layers,
  Building,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { CivicCategory, MasterIncident, PriorityLevel } from '../../types';

interface IncidentsViewProps {
  incidents: MasterIncident[];
  onInspectCluster: (incidentId: string) => void;
  onApproveAll: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onInspectCluster,
  onApproveAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || inc.category === selectedCategory;
    const matchesPrio = selectedPriority === 'All' || inc.priority === selectedPriority;
    return matchesSearch && matchesCat && matchesPrio;
  });

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Incident Deduplication & Work Order Studio
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00ADB5] border border-cyan-500/30">
              AI Spatial Cluster
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserves individual citizen accounts and communications while generating singular municipal execution orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onApproveAll}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Approve All Work Orders</span>
          </button>
        </div>
      </div>

      {/* Feature Showcase Banner: 20 Citizens -> 1 Master Incident */}
      <div className="glassmorphism p-5 sm:p-6 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-[#0F2744] via-[#163355] to-[#0F2744] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00ADB5] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Live Showcase: High-Density Deduplication</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Consolidated Incident #INC-2026-0841 — Severe Pothole Cluster
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong>20 unique citizen complaints</strong> submitted for the identical road defect near MG Road Metro Pillar 142. The system has automatically calculated a{' '}
              <span className="text-[#00ADB5] font-bold">94.8% duplicate confidence score</span> based on GPS radius (&le;18m), category matching, and semantic text embeddings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="text-center sm:text-right bg-[#0B192C]/60 p-3 rounded-xl border border-slate-700/80 w-full sm:w-auto">
              <div className="text-[11px] text-slate-400">Consolidated Savings</div>
              <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                19 Saved Dispatches
              </div>
            </div>
            <button
              onClick={() => onInspectCluster('INC-2026-0841')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#00ADB5] to-[#00F2FE] text-[#0B192C] font-extrabold text-xs hover:brightness-110 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <Combine className="w-4 h-4" />
              <span>Inspect 20 Linked Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0F2744]/70 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, keyword, or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B192C] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ADB5]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#00ADB5]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0B192C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Roads & Footpaths">Roads & Footpaths</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity & Streetlights">Electricity</option>
              <option value="Solid Waste Management">Solid Waste</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#0B192C] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* All Consolidated Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIncidents.map((inc) => {
          const isCritical = inc.priority === 'Critical';
          const isHigh = inc.priority === 'High';

          return (
            <div
              key={inc.id}
              className="glassmorphism rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[#00ADB5] font-bold">{inc.id}</span>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/20 text-[#00ADB5] border-cyan-500/30'
                    }`}
                  >
                    {inc.priority}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1 leading-snug">{inc.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{inc.description}</p>

                <div className="mt-4 p-3 rounded-xl bg-[#0B192C]/80 border border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consolidated Citizen Reports:</span>
                    <span className="font-bold text-white font-mono flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#00ADB5]" />
                      {inc.linkedReportsCount} merged
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deduplication Confidence:</span>
                    <span className="text-[#00ADB5] font-mono font-bold">{inc.confidence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Agency:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{inc.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Single Work Order:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      #{inc.workOrderId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">{inc.status}</span>
                <button
                  onClick={() => onInspectCluster(inc.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-[#00ADB5] hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/30 transition"
                >
                  Inspect Cluster
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
