import React from 'react';
import { BellRing, X, Check, Combine, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-3 sm:right-6 top-16 w-80 sm:w-96 glassmorphism rounded-2xl shadow-2xl z-50 p-4 border border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <BellRing className="w-4 h-4 text-[#00ADB5]" />
          <h4 className="font-bold text-sm text-white">System & Citizen Alerts</h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-[#00ADB5] hover:underline flex items-center gap-0.5"
            title="Mark all as read"
          >
            <Check className="w-3 h-3" />
            <span>Mark read</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
        {notifications.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No active notifications</p>
        ) : (
          notifications.map((notif) => {
            let borderColor = 'border-cyan-400';
            let Icon = Combine;

            if (notif.type === 'escalation') {
              borderColor = 'border-rose-400';
              Icon = AlertTriangle;
            } else if (notif.type === 'approved' || notif.type === 'resolved') {
              borderColor = 'border-emerald-400';
              Icon = CheckCircle2;
            }

            return (
              <div
                key={notif.id}
                className={`p-2.5 rounded-xl bg-[#0F2744]/90 border-l-4 ${borderColor} border border-slate-800/80 transition`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#00ADB5]" />
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{notif.timeAgo}</span>
                </div>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{notif.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
