import DashboardComponent from '../../components/dashboard/DashboardComponent'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time monitoring of your application and server metrics
          </p>
        </div>
        
        <DashboardComponent />
      </div>
    </div>
  )
}