// src/components/dashboard/DiskMetricCard.tsx
import { HardDrive, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProtectedApi } from '../../lib/api/protected';

interface DiskData {
  disk_used_gb: number;
  disk_total_gb: number;
  disk_free_gb: number;
  disk_percent: number;
  docker_usage: {
    total_size_gb: number;
    percentage_of_disk: number;
  };
  cleanup_potential: {
    total_potential_gb: number;
    docker_cache_gb: number;
    logs_cleanup_mb: number;
    package_cache_mb: number;
  };
  health_status: 'good' | 'caution' | 'warning' | 'error';
}

export const DiskMetricCard = () => {
  const [diskData, setDiskData] = useState<DiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const api = useProtectedApi();

  useEffect(() => {
    const fetchDiskData = async () => {
      try {
        const data = await api.get<DiskData>('/api/v1/metrics/disk');
        setDiskData(data);
      } catch (error) {
        console.error('Failed to fetch disk metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiskData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDiskData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [api]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-2 md:p-4 hover:shadow-md transition-shadow duration-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!diskData) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-2 md:p-4">
        <div className="text-center text-gray-500">
          <HardDrive className="h-4 w-4 mx-auto mb-1" />
          <p className="text-xs">Disk data unavailable</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'warning' || status === 'error' ? AlertTriangle : HardDrive;
  };

  const StatusIcon = getStatusIcon(diskData.health_status);

  return (
    <div 
      className="bg-white rounded-lg border shadow-sm p-2 md:p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">DISK USAGE</h3>
        <StatusIcon className={`h-3 w-3 ${getStatusColor(diskData.health_status)}`} />
      </div>
      
      <div className="space-y-0.5 md:space-y-1">
        <div className="flex justify-between items-baseline">
          <p className="text-base md:text-xl font-bold text-gray-900">
            {diskData.disk_used_gb}GB
          </p>
          <span className="text-xs text-gray-500">
            / {diskData.disk_total_gb}GB
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              diskData.disk_percent > 80 ? 'bg-red-500' : 
              diskData.disk_percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${diskData.disk_percent}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className={getStatusColor(diskData.health_status)}>
            {diskData.disk_percent}% used
          </span>
          {diskData.cleanup_potential.total_potential_gb > 0 && (
            <div className="flex items-center text-blue-600">
              <Trash2 className="h-3 w-3 mr-1" />
              <span>{diskData.cleanup_potential.total_potential_gb}GB cleanable</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Free space:</span>
              <span className="ml-1 font-medium">{diskData.disk_free_gb}GB</span>
            </div>
            <div>
              <span className="text-gray-500">Docker:</span>
              <span className="ml-1 font-medium">{diskData.docker_usage.total_size_gb}GB</span>
            </div>
            <div>
              <span className="text-gray-500">Cache cleanup:</span>
              <span className="ml-1 font-medium text-blue-600">{diskData.cleanup_potential.docker_cache_gb}GB</span>
            </div>
            <div>
              <span className="text-gray-500">Log cleanup:</span>
              <span className="ml-1 font-medium text-blue-600">{diskData.cleanup_potential.logs_cleanup_mb}MB</span>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-2">
            💡 Run <code className="bg-gray-100 px-1 rounded">make droplet-deep-clean</code> to free up space
          </div>
        </div>
      )}
    </div>
  );
};