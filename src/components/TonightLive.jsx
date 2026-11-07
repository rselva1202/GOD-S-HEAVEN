import { useEffect, useState } from 'react'
import { getTonightLiveMusic } from '../lib/api'

export default function TonightLive({ fallbackText = 'Artist lineup and timings: to be confirmed.' }) {
  const [tonight, setTonight] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getTonightLiveMusic()
      .then((data) => {
        if (isMounted && data) {
          setTonight(data)
        }
      })
      .catch(() => {
        // Fallback gracefully without throwing
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (tonight && tonight.artist && tonight.artist !== 'Artist lineup: to be confirmed') {
    return (
      <span className="tonight-live-highlight">
        <strong>Tonight:</strong> {tonight.artist} · {tonight.time}
      </span>
    )
  }

  return <span>{fallbackText}</span>
}
