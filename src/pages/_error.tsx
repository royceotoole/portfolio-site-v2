import { NextPage } from 'next'

interface ErrorProps {
  statusCode?: number
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="w-full px-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg mb-4">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </h2>
        <button
          className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 