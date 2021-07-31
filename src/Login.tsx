import React, { useEffect, useContext } from 'react'
import {
  login,
  handleIncomingRedirect,
  logout,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser'
import SessionContext, { SessionInfo } from './SessionContext'

const Login = () => {
  const [session, setSession] = useContext(SessionContext)

  useEffect(() => {
    ;(async () => {
      try {
        const info = await handleIncomingRedirect()
        if (info && info.isLoggedIn)
          setSession({ status: 'in', webId: info?.webId ?? '' })
        else setSession({ status: 'out', webId: '' })
      } catch (error) {
        alert('error signing in' + error.message)
        setSession({ status: 'out', webId: '' })
      }
    })()
  }, [setSession])

  const handleLogin = async () => {
    setSession({ status: 'pending', webId: '' })
    try {
      await login({
        oidcIssuer: 'https://solidcommunity.net',
        clientName: 'Solid Interests',
      })
      const { info } = getDefaultSession()
      setSession({ status: 'in', webId: info?.webId ?? '' })
      console.log(info)
    } catch (error) {
      alert(error.message)
      setSession({ status: 'out', webId: '' })
    }
  }

  const handleLogout = async () => {
    setSession((session: SessionInfo) => ({
      webId: session.webId,
      status: 'pending',
    }))
    try {
      await logout()
      setSession({ status: 'out', webId: '' })
    } catch (error) {
      alert(error.message)
      setSession((session: SessionInfo) => ({
        webId: session.webId,
        status: 'in',
      }))
    }
  }

  if (session.status === 'pending') return <>Loading</>
  if (session.status === 'in')
    return <button onClick={handleLogout}>Log out</button>
  return <button onClick={handleLogin}>Log in</button>
}

export default Login
