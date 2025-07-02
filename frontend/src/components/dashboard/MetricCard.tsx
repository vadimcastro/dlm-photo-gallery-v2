// src/components/dashboard/MetricCard.tsx
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

export const MetricCard = ({
  title,
  value,
  change,
  description,
  icon: Icon,
  trend
}: MetricCardProps) => (
  <div className="bg-white rounded-lg border shadow-sm p-2 md:p-4 hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-center mb-1 md:mb-2">
      <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
      <Icon className="h-3 w-3 text-gray-500" />
    </div>
    <div className="space-y-0.5 md:space-y-1">
      <p className="text-base md:text-xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center text-xs">
        <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
          {change}
        </span>
        <span className="ml-1 text-gray-500">{description}</span>
      </div>
    </div>
  </div>
)