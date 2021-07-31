import React, { ReactNode, useState } from 'react'
import SessionContext, { SessionInfo } from './SessionContext'
interface Props {
  children: ReactNode
}

const SessionProvider: React.FC<Props> = ({ children }) => {
  const [info, setInfo] = useState<SessionInfo>({
    status: 'pending',
    webId: '',
  })
  return (
    <SessionContext.Provider value={[info, setInfo]}>
      {children}
    </SessionContext.Provider>
  )
}

export default SessionProvider
