import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Clock, CheckCircle2, Star, TrendingDown, Building, ShieldCheck } from 'lucide-react';

Chart.register(...registerables);

export const AnalyticsView: React.FC = () => {
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance1 = useRef<Chart | null>(null);
  const chartInstance2 = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance1.current) chartInstance1.current.destroy();
    if (chartInstance2.current) chartInstance2.current.destroy();

    // Bar Chart: Regional Ingestion
    if (barChartRef.current) {
      chartInstance1.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: [
            'Central Metro Ward 03',
            'North Zone Ward 14',
            'South Suburb GP 08',
            'East Industrial Ward 21',
          ],
          datasets: [
            {
              label: 'Raw Citizen Reports',
              data: [74, 45, 30, 52],
              backgroundColor: '#1E3E62',
              borderRadius: 6,
            },
            {
              label: 'Clustered Singular Work Orders',
              data: [18, 12, 9, 14],
              backgroundColor: '#00ADB5',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#CBD5E1', font: { size: 11 } },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94A3B8', font: { size: 10 } },
              grid: { display: false },
            },
            y: {
              ticks: { color: '#94A3B8', font: { size: 10 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
            },
          },
        },
      });
    }

    // Radar Chart: SLA Target vs Actual
    if (radarChartRef.current) {
      chartInstance2.current = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: [
            'Roads & Potholes',
            'Water Leakages',
            'Electrical Streetlights',
            'Sanitation & Drains',
            'Public Safety Hazards',
          ],
          datasets: [
            {
              label: 'Target SLA (Hours)',
              data: [12, 6, 8, 10, 4],
              borderColor: '#94A3B8',
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              pointBackgroundColor: '#94A3B8',
            },
            {
              label: 'Actual Achieved Turnaround (Hours)',
              data: [8, 4.5, 5, 7, 2.5],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              pointBackgroundColor: '#10B981',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#CBD5E1', font: { size: 11 } },
            },
          },
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              pointLabels: { color: '#94A3B8', font: { size: 10 } },
              ticks: { backdropColor: 'transparent', color: '#94A3B8' },
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
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Smart City Performance & SLA Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Operational throughput, regional resolution times, contractor performance, and agent triage precision metrics.
        </p>
      </div>

      {/* Top 4 High-level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glassmorphism p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#00ADB5]" />
            <span>Avg Time to Work Order</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00ADB5] font-mono mt-2">
            42 Seconds
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>Down from 18 hrs manual triage</span>
          </div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Duplicate Clustered Volume</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-2">
            104 Reports
          </div>
          <div className="text-[10px] text-[#00ADB5] mt-1 font-semibold">
            Grouped into 12 work orders
          </div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLA Compliance Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-2">
            97.8%
          </div>
          <div className="text-[10px] text-slate-300 mt-1">
            &lt; 24h standard response achieved
          </div>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Citizen Satisfaction</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-2">
            4.8 / 5.0
          </div>
          <div className="text-[10px] text-slate-300 mt-1">
            From 482 survey feedbacks
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glassmorphism rounded-3xl p-5 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-2">Regional Ingestion & Resolution Matrix</h4>
          <p className="text-xs text-slate-400 mb-4">
            Comparison between raw complaints reported vs clustered work packages dispatched.
          </p>
          <div className="w-full h-64">
            <canvas ref={barChartRef} />
          </div>
        </div>

        <div className="glassmorphism rounded-3xl p-5 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-2">Priority Resolution Turnaround (Hours)</h4>
          <p className="text-xs text-slate-400 mb-4">
            Benchmark SLA target response vs actual achieved contractor completion time.
          </p>
          <div className="w-full h-64">
            <canvas ref={radarChartRef} />
          </div>
        </div>
      </div>

      {/* Department SLA Breakdown Table */}
      <div className="glassmorphism rounded-3xl p-5 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#00ADB5]" />
          <span>Municipal Department SLA & Contractor Metrics</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2744] text-slate-300 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Department</th>
                <th className="py-2.5 px-3">Active Work Orders</th>
                <th className="py-2.5 px-3">Target SLA</th>
                <th className="py-2.5 px-3">Mean Turnaround</th>
                <th className="py-2.5 px-3">Escalation Rate</th>
                <th className="py-2.5 px-3 rounded-r-lg">Citizen Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {[
                { name: 'Roads & Infrastructure', wo: 14, sla: '12 hrs', avg: '8.2 hrs', esc: '1.4%', rating: '4.7 ★' },
                { name: 'Water Supply & Sewerage', wo: 9, sla: '6 hrs', avg: '4.5 hrs', esc: '2.1%', rating: '4.9 ★' },
                { name: 'Electrical Utilities', wo: 6, sla: '8 hrs', avg: '5.1 hrs', esc: '0.8%', rating: '4.8 ★' },
                { name: 'Solid Waste Management', wo: 11, sla: '12 hrs', avg: '7.4 hrs', esc: '3.0%', rating: '4.6 ★' },
                { name: 'Drainage & Sanitation', wo: 7, sla: '10 hrs', avg: '6.8 hrs', esc: '1.9%', rating: '4.7 ★' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{row.name}</td>
                  <td className="py-3 px-3 font-mono text-[#00ADB5]">{row.wo} Active</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{row.sla}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{row.avg}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{row.esc}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
