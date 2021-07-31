import { createContext } from 'react'

export type SessionInfo = {
  status: 'in' | 'out' | 'pending'
  webId: string
}

const SessionContext = createContext<
  [SessionInfo, React.Dispatch<React.SetStateAction<SessionInfo>>]
>([
  { status: 'out', webId: '' },
  () => {
    return
  },
])

export default SessionContext
