'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong!</h2>
        <p className="text-sm text-red-600 mb-2">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-red-400 mb-4">Digest: {error.digest}</p>
        )}
        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
