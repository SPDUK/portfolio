import { useCallback, useEffect, useRef, useState } from 'react'
import {
  armStartupWatchdog,
  releaseStartupDocument,
  StartupPhase,
} from './startup'

export function useStartup(ready: boolean) {
  const [phase, setPhase] = useState<StartupPhase>('presenting')
  const [run, setRun] = useState(0)
  const current = useRef<StartupPhase>('presenting')
  const claimed = useRef(false)
  const complete = useCallback(() => {
    releaseStartupDocument()
    current.current = 'complete'
    setPhase('complete')
  }, [])
  const reveal = useCallback(() => {
    if (current.current !== 'presenting') return
    current.current = 'revealing'
    setPhase('revealing')
  }, [])
  const replay = useCallback(() => {
    if (current.current !== 'complete') return
    document.documentElement.dataset.spdevStartup = 'active'
    claimed.current = false
    current.current = 'presenting'
    setPhase('presenting')
    setRun(value => value + 1)
  }, [])
  useEffect(() => {
    if (!ready || current.current === 'complete') return undefined
    if (!claimed.current) {
      if (document.documentElement.dataset.spdevStartup === 'complete') {
        complete()
        return undefined
      }
      claimed.current = true
      document.documentElement.dataset.spdevStartup = 'running'
    }
    armStartupWatchdog()
    return undefined
  }, [ready, run, complete])
  useEffect(() => {
    window.addEventListener('spdev:startup-watchdog', complete)
    return () => {
      window.removeEventListener('spdev:startup-watchdog', complete)
    }
  }, [complete])
  return { phase, complete, reveal, replay, active: phase !== 'complete' }
}
