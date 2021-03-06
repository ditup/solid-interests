import React, { useState } from 'react'

interface Props {
  onLogin: (oidcIssuer: string) => void
}

const LoginPrompt: React.FC<Props> = ({ onLogin, ...props }: Props) => {
  const [promptOpen, setPromptOpen] = useState(false)
  const [idp, setIdp] = useState(
    localStorage.getItem('idp') ?? 'https://solidcommunity.net',
  )

  const onSubmit: React.FormEventHandler = e => {
    e.preventDefault()
    localStorage.setItem('idp', idp)
    onLogin(idp)
  }

  const onChangeInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    const newValue = e.currentTarget.value
    setIdp(newValue)
  }

  if (!promptOpen) {
    return (
      <button
        {...props}
        className="button"
        onClick={e => {
          e.preventDefault()
          setPromptOpen(true)
        }}
      >
        Login
      </button>
    )
  }

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">Select your Solid identity provider</p>
      </header>
      <div className="card-content">
        <form onSubmit={onSubmit}>
          <div className="field">
            <div className="control">
              <input
                id="idp"
                className="input"
                type="url"
                value={idp}
                onChange={onChangeInput}
                placeholder="Where is your Solid Pod?"
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <input type="submit" value="Connect" className="button is-link" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPrompt
