import React, { useContext } from 'react'
import Login from './Login'
import Profile from './Profile'
import SessionContext from './SessionContext'

function App() {
  const [info] = useContext(SessionContext)
  return (
    <>
      <Login />
      {info.status === 'in' && <Profile webId={info.webId} />}
    </>
  )
}

export default App
