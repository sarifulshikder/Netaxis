import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
  color: string;
  currency?: boolean;
}

export default function StatsCard({ 
  title, value, icon: Icon, trend, trendLabel, color, currency 
}: StatsCardProps) {
  const isPositive = trend?.startsWith('+');

  return (
    <div className="glass-card p-6 group hover:border-white/20 transition-all duration-300 animate-in">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {currency ? "৳" : ""}{value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={color.replace("bg-", "text-")} />
        </div>
      </div>
      
      {(trend || trendLabel) && (
        <div className="mt-6 flex items-center space-x-2">
          {trend && (
            <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
              isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}>
              {trend}
            </div>
          )}
          <span className="text-xs text-slate-500 font-medium">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
