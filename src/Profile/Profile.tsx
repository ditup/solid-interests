import React from 'react'
import { User } from '.'

interface Props {
  user: User
}

const Profile: React.FC<Props> = ({ user }) => {
  return <div>{JSON.stringify(user || {})}</div>
}

export default Profile
