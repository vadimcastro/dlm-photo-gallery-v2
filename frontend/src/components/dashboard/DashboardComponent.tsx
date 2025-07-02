'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Users, FileText, Cpu, HardDrive, Wifi, Server, Zap, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { useProtectedApi } from '../../lib/api/protected';
import { MetricCard } from './MetricCard';
import { DiskMetricCard } from './DiskMetricCard';
import { DashboardHeader } from './DashboardHeader';

interface DashboardMetrics {
  visitors: {
    total: number;
    percentageChange: number;
    lastMonthTotal: number;
  };
  projects: {
    total: number;
    newThisMonth: number;
    percentageChange: number;
    lastMonthTotal: number;
  };
  sessions: {
    active: number;
    percentageChange: number;
    previousHourActive: number;
    totalToday: number;
  };
  system: {
    cpu: {
      usage_percent: number;
      cores: number;
      load_average?: number[];
    };
    memory: {
      used_gb: number;
      total_gb: number;
      usage_percent: number;
      available_gb: number;
    };
    disk: {
      used_gb: number;
      total_gb: number;
      usage_percent: number;
      free_gb: number;
    };
    docker: {
      containers: Array<{
        name: string;
        status: string;
        ports: string;
      }>;
      total_running: number;
    };
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
    active_connections: number;
    total_connections: number;
  };
  health: {
    memory_usage_mb: number;
    cpu_percent: number;
    uptime_seconds: number;
    uptime_human: string;
    thread_count: number;
    status: string;
  };
  deployment: {
    current_branch: string;
    commit_hash: string;
    commit_message: string;
    commit_date: string;
    environment: string;
    deploy_time: string;
  };
}

const DashboardComponent = () => {
  const api = useProtectedApi();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [visitorsData, projectsData, sessionsData, systemData, networkData, healthData, deploymentData] = await Promise.all([
        api.get<DashboardMetrics['visitors']>('/api/v1/metrics/visitors'),
        api.get<DashboardMetrics['projects']>('/api/v1/metrics/projects'),
        api.get<DashboardMetrics['sessions']>('/api/v1/metrics/sessions'),
        api.get<DashboardMetrics['system']>('/api/v1/metrics/system'),
        api.get<DashboardMetrics['network']>('/api/v1/metrics/network'),
        api.get<DashboardMetrics['health']>('/api/v1/metrics/health'),
        api.get<DashboardMetrics['deployment']>('/api/v1/metrics/deployment'),
      ]);

      setMetrics({
        visitors: visitorsData,
        projects: projectsData,
        sessions: sessionsData,
        system: systemData,
        network: networkData,
        health: healthData,
        deployment: deploymentData,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError('Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboardMetrics();
    const pollInterval = setInterval(fetchDashboardMetrics, 5 * 60 * 1000);
    return () => clearInterval(pollInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number): string => {
    const prefix = num > 0 ? '+' : '';
    return `${prefix}${num.toFixed(1)}%`;
  };

  const formatLastUpdated = (): string => {
    const minutes = Math.round((new Date().getTime() - lastUpdated.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"/>
      </div>
    );
  }

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 ** 3);
    if (gb > 1) return `${gb.toFixed(1)}GB`;
    const mb = bytes / (1024 ** 2);
    return `${mb.toFixed(0)}MB`;
  };

  const systemStats = metrics ? [
    {
      title: "Deploy Branch",
      value: metrics.deployment.current_branch,
      change: metrics.deployment.commit_hash,
      icon: GitBranch,
      description: "current",
      trend: "up" as const
    },
    {
      title: "CPU Usage",
      value: `${metrics.system.cpu.usage_percent.toFixed(1)}%`,
      change: `${metrics.system.cpu.cores} cores`,
      icon: Cpu,
      description: "system load",
      trend: metrics.system.cpu.usage_percent < 70 ? "up" as const : "down" as const
    },
    {
      title: "Memory",
      value: `${metrics.system.memory.usage_percent.toFixed(0)}%`,
      change: `${metrics.system.memory.used_gb}GB used`,
      icon: Zap,
      description: `of ${metrics.system.memory.total_gb}GB`,
      trend: metrics.system.memory.usage_percent < 80 ? "up" as const : "down" as const
    },
    {
      title: "Disk Space",
      value: `${metrics.system.disk.free_gb.toFixed(1)}GB`,
      change: `${metrics.system.disk.usage_percent.toFixed(0)}% used`,
      icon: HardDrive,
      description: "free space",
      trend: metrics.system.disk.usage_percent < 80 ? "up" as const : "down" as const
    },
    {
      title: "Network",
      value: formatBytes(metrics.network.bytes_recv),
      change: `${metrics.network.active_connections} connections`,
      icon: Wifi,
      description: "received",
      trend: "up" as const
    },
    {
      title: "API Health",
      value: `${metrics.health.memory_usage_mb.toFixed(0)}MB`,
      change: metrics.health.uptime_human,
      icon: Server,
      description: "uptime",
      trend: metrics.health.status === 'healthy' ? "up" as const : "down" as const
    },
    {
      title: "Containers",
      value: formatNumber(metrics.system.docker.total_running || 0),
      change: "running",
      icon: Server,
      description: "docker",
      trend: "up" as const
    }
  ] : [];

  const siteStats = metrics ? [
    {
      title: "Visitors",
      value: formatNumber(metrics.visitors.total),
      change: formatPercentage(metrics.visitors.percentageChange),
      icon: Users,
      description: "vs. last month",
      trend: metrics.visitors.percentageChange >= 0 ? "up" as const : "down" as const
    },
    {
      title: "Projects",
      value: formatNumber(metrics.projects.total),
      change: formatPercentage(metrics.projects.percentageChange),
      icon: FileText,
      description: "vs. last month",
      trend: metrics.projects.percentageChange >= 0 ? "up" as const : "down" as const
    },
    {
      title: "Sessions",
      value: formatNumber(metrics.sessions.active),
      change: formatPercentage(metrics.sessions.percentageChange),
      icon: Activity,
      description: "vs. last hour",
      trend: metrics.sessions.percentageChange >= 0 ? "up" as const : "down" as const
    }
  ] : [];

  const allStats = [...systemStats, ...siteStats];

  return (
    <div className="max-w-[95%] mx-auto px-1 md:px-4 py-4 space-y-6">
      <DashboardHeader
        lastUpdated={formatLastUpdated()}
        onRefresh={fetchDashboardMetrics}
        isRefreshing={isRefreshing}
      />
      
      <div className="space-y-3">
        {/* Mobile view: show limited metrics with expand/collapse */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 gap-2">
            {(showAllMetrics ? allStats : allStats.slice(0, 5)).map((stat, index) => (
              <MetricCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
              />
            ))}
          </div>
          
          {allStats.length > 5 && (
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setShowAllMetrics(!showAllMetrics)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>{showAllMetrics ? 'Show Less' : `Show ${allStats.length - 5} More`}</span>
                {showAllMetrics ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Desktop view: show all metrics always */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
            {allStats.map((stat, index) => (
              <MetricCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
              />
            ))}
            {/* Disk usage card with special layout */}
            <DiskMetricCard />
          </div>
        </div>
        
        {/* Mobile: Add disk card separately for better mobile layout */}
        <div className="lg:hidden">
          <DiskMetricCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;