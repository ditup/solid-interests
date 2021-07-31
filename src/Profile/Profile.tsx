import React from 'react'
import { Interest, User } from '.'
import styled from 'styled-components'
import InterestSearch from '../InterestSearch'
import InterestTag from './InterestTag'

interface Props {
  user: User
  onAddInterest: (interest: Interest) => void
  onRemoveInterest: (interest: Interest) => void
}

const Photo = styled.img`
  && {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Profile: React.FC<Props> = ({
  user,
  onAddInterest,
  onRemoveInterest,
}) => {
  const interests = Object.values(user.interests)
  return (
    <div className="card">
      <div className="card-content">
        <div className="media">
          <div className="media-left">
            <figure className="image is-48x48">
              {user.photo && (
                <Photo src={user.photo} alt={`Photo of ${user.name}`} />
              )}
            </figure>
          </div>
          <div className="media-content">
            <p className="title is-4">{user.name}</p>
            <p className="subtitle is-6">
              <a href={user.webId}>{user.webId}</a>
            </p>
          </div>
        </div>

        <div className="content">
          {interests.length > 0 ? (
            <div className="field is-grouped is-grouped-multiline">
              {interests.map(interest => (
                <div key={interest.uri} className="control">
                  <InterestTag
                    interest={interest}
                    onClose={() => onRemoveInterest(interest)}
                  />
                </div>
              ))}
            </div>
          ) : (
            'no interests'
          )}
          <InterestSearch onSelectInterest={onAddInterest} />
        </div>
      </div>
    </div>
  )
}

export default Profile
