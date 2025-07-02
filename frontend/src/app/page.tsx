import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          DLM Photo Gallery
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Dan's personal photo gallery powered by modern web technology
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/gallery"
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
          >
            📸 View Gallery
          </Link>
          
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">📸 Photos</h3>
            <p>Upload and organize your memories</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">🎨 Albums</h3>
            <p>Create beautiful photo collections</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile-First</h3>
            <p>Perfect viewing on any device</p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Built with{' '}
          <a 
            href="https://github.com/vadimcastro/vadim-project-template" 
            className="text-purple-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            vadim-project-template
          </a>
        </div>
      </div>
    </div>
  )
}