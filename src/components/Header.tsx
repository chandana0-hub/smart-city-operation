import React from 'react';
import {
  Cpu,
  MapPin,
  Bell,
  ShieldCheck,
  User,
  LayoutDashboard,
  Combine,
  Bot,
  Map as MapIcon,
  BarChart3,
  Home,
  FileCode2,
} from 'lucide-react';
import { RegionZone } from '../types';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  activeRegion: RegionZone;
  onRegionChange: (region: RegionZone) => void;
  unreadCount: number;
  onToggleNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isAdmin,
  onToggleAdmin,
  activeRegion,
  onRegionChange,
  unreadCount,
  onToggleNotifications,
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'citizen', label: 'Citizen Portal', icon: User },
    { id: 'dashboard', label: 'Operations Hub', icon: LayoutDashboard },
    { id: 'incidents', label: 'Deduplication Studio', icon: Combine },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'map', label: 'Live GIS Map', icon: MapIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'architecture', label: 'Wix Architecture', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 glassmorphism border-b border-cyan-500/20 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
          onClick={() => onViewChange('landing')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00ADB5] to-[#00F2FE] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B192C]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                CivicFlow<span className="text-[#00ADB5]">.AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-[#00ADB5] border border-cyan-500/30">
                Smart City OS
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400">Agentic Civic Operations System</p>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/15 text-[#00ADB5] border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Region Selector */}
          <div className="hidden md:flex items-center bg-[#0F2744] border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#00ADB5] mr-1.5 shrink-0" />
            <select
              value={activeRegion}
              onChange={(e) => onRegionChange(e.target.value as RegionZone)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-[#0B192C]">
                All Municipal Zones
              </option>
              <option value="Central Metro - Ward 03" className="bg-[#0B192C]">
                Central Metro - Ward 03
              </option>
              <option value="North Zone - Ward 14" className="bg-[#0B192C]">
                North Zone - Ward 14
              </option>
              <option value="South Suburb - GP 08" className="bg-[#0B192C]">
                South Suburb - GP 08
              </option>
              <option value="East Industrial - Ward 21" className="bg-[#0B192C]">
                East Industrial - Ward 21
              </option>
            </select>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-lg bg-[#0F2744] hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 sm:py-2 rounded-lg transition shadow-md ${
              isAdmin
                ? 'bg-gradient-to-r from-[#00ADB5] to-[#00F2FE] text-[#0B192C] hover:brightness-110'
                : 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAdmin ? 'Admin View' : 'Citizen View'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="lg:hidden flex items-center space-x-1.5 overflow-x-auto pt-2 pb-1 text-xs border-t border-slate-800/80 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-2.5 py-1 rounded-md font-medium shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'bg-cyan-500/20 text-[#00ADB5] border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
