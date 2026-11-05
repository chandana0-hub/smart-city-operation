import React, { useState, useRef, useEffect } from 'react';
import {
  Tag,
  Combine,
  Flame,
  Navigation,
  ClipboardList,
  MessageSquare,
  Copy,
  Check,
  Pause,
  Play,
  Trash2,
  Terminal,
  Activity,
} from 'lucide-react';
import { AIAgentInfo, TerminalLogEntry } from '../../types';

interface AgentsViewProps {
  agents: AIAgentInfo[];
  terminalLogs: TerminalLogEntry[];
  onClearLogs: () => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  terminalLogs,
  onClearLogs,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal unless paused
  useEffect(() => {
    if (!isPaused && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isPaused]);

  const handleCopyLogs = () => {
    const text = terminalLogs
      .map((l) => `[${l.timestamp}] [${l.agent}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs =
    selectedAgentFilter === 'ALL'
      ? terminalLogs
      : terminalLogs.filter((l) => l.agent.includes(selectedAgentFilter));

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tag':
        return Tag;
      case 'Combine':
        return Combine;
      case 'Flame':
        return Flame;
      case 'Navigation':
        return Navigation;
      case 'ClipboardList':
        return ClipboardList;
      case 'MessageSquare':
        return MessageSquare;
      default:
        return Activity;
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          Autonomous AI Agent Operations Center
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
            6 Specialized Agents
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Inspect real-time execution pipelines, reasoning decisions, and inter-agent event bus communication.
        </p>
      </div>

      {/* 6 AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent, index) => {
          const Icon = getAgentIcon(agent.icon);
          const isPulse = agent.status === 'Deduplicating' || agent.status === 'Active';

          return (
            <div
              key={agent.id}
              className="glassmorphism p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00ADB5] ${
                      isPulse ? 'agent-pulse' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      agent.status === 'Deduplicating'
                        ? 'bg-cyan-500/15 text-[#00ADB5] border-cyan-500/30'
                        : agent.status === 'Scoring'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : agent.status === 'Routing'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : agent.status === 'Planning'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{agent.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-[#00ADB5] font-bold">0{index + 1}.</span>
                  <h3 className="text-base font-bold text-white">{agent.name}</h3>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{agent.role}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{agent.description}</p>

                <div className="mt-4 p-3 rounded-2xl bg-[#0B192C]/80 border border-slate-800 text-[11px] space-y-1.5">
                  <div className="text-slate-400">
                    Last Event: <span className="text-slate-200">{agent.lastAction}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>
                      Confidence: <strong className="text-[#00ADB5] font-mono">{agent.confidence}</strong>
                    </span>
                    <span>
                      Latency: <strong className="text-slate-200 font-mono">{agent.latency}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Decisions: <strong className="text-white font-mono">{agent.totalDecisions}</strong>
                </span>
                <span className="text-[#00ADB5] font-semibold">{agent.metricBadge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Stream Log Terminal */}
      <div className="glassmorphism rounded-3xl p-5 border border-slate-800 font-mono text-xs shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300 font-bold ml-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#00ADB5]" />
              CivicFlow AI Multi-Agent Execution Bus (Live Event Stream)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by agent */}
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-[#0B192C] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Agents</option>
              <option value="CLASSIFY">Classification Agent</option>
              <option value="DEDUP">Duplicate Detection Agent</option>
              <option value="PRIORITY">Priority Agent</option>
              <option value="ROUTER">Router Agent</option>
              <option value="PLANNER">Planner Agent</option>
              <option value="NOTIFY">Notification Agent</option>
            </select>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition"
              title={isPaused ? 'Resume stream' : 'Pause stream'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition"
              title="Copy Terminal Logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="mt-4 space-y-2 text-slate-300 max-h-64 sm:max-h-72 overflow-y-auto pr-2 font-mono text-[11px] leading-relaxed">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${log.color}`}>[{log.agent}]</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </section>
  );
};
