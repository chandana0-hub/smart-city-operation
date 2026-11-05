import React, { useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Combine,
  FileText,
  RefreshCw,
  TrendingUp,
  Layers,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { MasterIncident, RegionZone } from '../../types';

Chart.register(...registerables);

interface DashboardViewProps {
  incidents: MasterIncident[];
  onInspectCluster: (incidentId: string) => void;
  onSimulateFlood: () => void;
  onNavigate: (view: string) => void;
  activeRegion: RegionZone;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  onInspectCluster,
  onSimulateFlood,
  onNavigate,
  activeRegion,
}) => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance1 = useRef<Chart | null>(null);
  const chartInstance2 = useRef<Chart | null>(null);

  const filteredIncidents =
    activeRegion === 'All'
      ? incidents
      : incidents.filter((i) => i.region === activeRegion);

  const totalRawReports = filteredIncidents.reduce(
    (acc, curr) => acc + curr.linkedReportsCount,
    0
  );
  const totalConsolidated = filteredIncidents.length;
  const criticalCount = filteredIncidents.filter((i) => i.priority === 'Critical').length;
  const savingsPercent =
    totalRawReports > 0
      ? (((totalRawReports - totalConsolidated) / totalRawReports) * 100).toFixed(1)
      : '73.2';

  // Initialize Chart.js
  useEffect(() => {
    // Destroy previous instances
    if (chartInstance1.current) chartInstance1.current.destroy();
    if (chartInstance2.current) chartInstance2.current.destroy();

    // Line Chart
    if (lineChartRef.current) {
      chartInstance1.current = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Raw Citizen Submissions',
              data: [42, 68, 55, 90, 110, 85, 142],
              borderColor: '#94A3B8',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#94A3B8',
            },
            {
              label: 'Consolidated Incidents (Single Work Orders)',
              data: [12, 18, 14, 22, 26, 20, 38],
              borderColor: '#00ADB5',
              backgroundColor: 'rgba(0, 173, 181, 0.25)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#00F2FE',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#CBD5E1', font: { size: 11, family: 'sans-serif' } },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94A3B8', font: { size: 10 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            y: {
              ticks: { color: '#94A3B8', font: { size: 10 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
            },
          },
        },
      });
    }

    // Doughnut Chart
    if (doughnutChartRef.current) {
      chartInstance2.current = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Roads', 'Water', 'Electricity', 'Waste', 'Drainage', 'Safety'],
          datasets: [
            {
              data: [45, 25, 15, 20, 10, 5],
              backgroundColor: [
                '#00ADB5',
                '#38BDF8',
                '#F59E0B',
                '#10B981',
                '#A855F7',
                '#EF4444',
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#CBD5E1', font: { size: 10, family: 'sans-serif' } },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, []);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            City Operations Command Center
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Online
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Metropolitan Municipal Corporation & Panchayati Raj Network &bull;{' '}
            <span className="text-[#00ADB5] font-semibold">{activeRegion}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateFlood}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-[#00ADB5] border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Incoming Flood (20 Pothole Reports)</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="glassmorphism p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Ingested Reports</span>
            <FileText className="w-4 h-4 text-[#00ADB5]" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {totalRawReports > 0 ? totalRawReports : 142}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% this week
          </div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-cyan-500/40 bg-[#0F2744]/70">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Consolidated Incidents</span>
            <Combine className="w-4 h-4 text-[#00ADB5]" />
          </div>
          <div className="text-2xl font-extrabold text-[#00ADB5] mt-2 font-mono">
            {totalConsolidated}
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            Deduplication Savings: <span className="text-emerald-400 font-bold">{savingsPercent}%</span>
          </div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Emergencies</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate Dispatch Active</div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resolved This Week</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">96</div>
          <div className="text-[11px] text-slate-400 mt-1">Avg turnaround 4.2 hrs</div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Autonomous Agent Ops</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 mt-2 font-mono">1,824 ops</div>
          <div className="text-[11px] text-slate-400 mt-1">0 Human Latency in Triage</div>
        </div>
      </div>

      {/* Middle Section: Live Master Incidents Table + Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Master Incidents Table */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00ADB5]" />
                  Active Consolidated Master Incidents
                </h3>
                <p className="text-xs text-slate-400">
                  Multiple citizen tickets merged into unified municipal work orders
                </p>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs text-[#00ADB5] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2744] text-slate-300 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Incident ID</th>
                    <th className="py-2.5 px-3">Category & Title</th>
                    <th className="py-2.5 px-3">Linked Reports</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredIncidents.map((inc) => {
                    const isCritical = inc.priority === 'Critical';
                    const isHigh = inc.priority === 'High';

                    return (
                      <tr
                        key={inc.id}
                        className="hover:bg-slate-800/50 transition cursor-pointer"
                        onClick={() => onInspectCluster(inc.id)}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#00ADB5] whitespace-nowrap">
                          {inc.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-white max-w-xs truncate">{inc.title}</div>
                          <div className="text-[10px] text-slate-400">{inc.region}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            <Layers className="w-3 h-3 text-[#00ADB5]" />
                            <span>{inc.linkedReportsCount} Reports</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : isHigh
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-cyan-500/20 text-[#00ADB5] border-cyan-500/30'
                            }`}
                          >
                            {inc.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-[140px] truncate">
                          {inc.department}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspectCluster(inc.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-[#00ADB5] hover:bg-cyan-500/25 text-[11px] font-semibold border border-cyan-500/30 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing {filteredIncidents.length} consolidated incidents</span>
            <span className="text-[#00ADB5] font-mono">Deduplication Cluster Active</span>
          </div>
        </div>

        {/* Department Workload Widget */}
        <div className="glassmorphism rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-[#00ADB5]" />
              Department Dispatch Workload
            </h3>
            <p className="text-xs text-slate-400 mb-4">Live capacity of assigned municipal units</p>

            <div className="space-y-3.5">
              {[
                { name: 'Roads & Infrastructure', load: 78, color: 'bg-cyan-400' },
                { name: 'Water Supply & Sewerage', load: 64, color: 'bg-blue-400' },
                { name: 'Solid Waste Management', load: 45, color: 'bg-emerald-400' },
                { name: 'Electrical Utilities', load: 52, color: 'bg-amber-400' },
                { name: 'Drainage & Sanitation', load: 38, color: 'bg-purple-400' },
              ].map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{d.name}</span>
                    <span className="text-slate-400 font-mono">{d.load}% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`${d.color} h-1.5 rounded-full`} style={{ width: `${d.load}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
            <span>Autonomous load-balancing</span>
            <span className="text-[#00ADB5] font-mono">6 Departments Synced</span>
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glassmorphism rounded-2xl p-5 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3">
            Reports Ingestion vs Incident Consolidation (7 Days)
          </h4>
          <div className="w-full h-60">
            <canvas ref={lineChartRef} />
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3">
            Category Breakdown & Duplicate Frequency
          </h4>
          <div className="w-full h-60">
            <canvas ref={doughnutChartRef} />
          </div>
        </div>
      </div>
    </section>
  );
};
