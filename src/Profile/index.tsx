import React, { useEffect, useState } from 'react'
import WebIdForm from './WebIdForm'
import {
  getSolidDataset,
  getTerm,
  getThing,
  getUrlAll,
  IriString,
} from '@inrupt/solid-client'
// import { fetch } from '@inrupt/solid-client-authn-browser'
import * as auth from '@inrupt/solid-client-authn-browser'
import Profile from './Profile'
import { foaf, vcard } from 'rdf-namespaces'
import { getInterest } from '../data'

interface Props {
  webId: string
}

export type Interest = {
  label: string
  uri: IriString
  description: string
}

export type User = {
  webId: string
  name: string
  photo: string
  interests: { [uri: string]: Interest }
}

const ProfileContainer: React.FC<Props> = ({ webId }) => {
  const [userId, setUserId] = useState(webId)
  const [user, setUser] = useState<User>({
    webId: '',
    name: '',
    photo: '',
    interests: {},
  })

  const handleChangeUser = (newUserId: string) => {
    console.log(userId)
    setUserId(newUserId)
  }

  // fetch the new user when userId changes
  useEffect(() => {
    ;(async () => {
      const dataset = await getSolidDataset(userId, { fetch: auth.fetch })
      const user = getThing(dataset, userId)
      if (user) {
        const name = getTerm(user, foaf.name)?.value ?? ''
        const photo =
          getTerm(user, foaf.img)?.value ??
          getTerm(user, vcard.hasPhoto)?.value ??
          ''
        const interestUris = getUrlAll(user, foaf.topic_interest)
        const interests = await Promise.all(
          interestUris.map(uri => getInterest(uri)),
        )
        const interestDict = Object.fromEntries(
          interests.map(interest => [interest.uri, interest]),
        )
        setUser({ name, photo, webId: userId, interests: interestDict })
      }
    })()
  }, [userId, webId])

  return (
    <>
      <WebIdForm webId={webId} onChangeUser={handleChangeUser} />
      <Profile user={user} />
    </>
  )
}

export default ProfileContainer
