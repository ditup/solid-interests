import React, { FormEvent, useState } from 'react'

interface Props {
  webId: string
  onChangeUser: (webId: string) => void
}

const WebIdForm: React.FC<Props> = ({ webId, onChangeUser }) => {
  const [userId, setUserId] = useState(webId)

  const handleChangeUserId = async (e: FormEvent) => {
    e.preventDefault()
    onChangeUser(userId)
  }

  return (
    <>
      <form onSubmit={handleChangeUserId}>
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button type="button" onClick={() => setUserId(webId)}>
          my webId
        </button>
      </form>
    </>
  )
}

export default WebIdForm
