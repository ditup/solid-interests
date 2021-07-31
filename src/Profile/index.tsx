import React, { useEffect, useState } from 'react'
import WebIdForm from './WebIdForm'
import {
  addUrl,
  getSolidDataset,
  getTerm,
  getThing,
  getUrlAll,
  IriString,
  removeUrl,
  saveSolidDatasetAt,
  setThing,
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
    setUserId(newUserId)
  }

  const handleAddInterest = async (interest: Interest) => {
    if (!Object.keys(user.interests).includes(interest.uri)) {
      setUser(user => ({
        ...user,
        interests: { ...user.interests, ...{ [interest.uri]: interest } },
      }))
      const dataset = await getSolidDataset(userId, { fetch: auth.fetch })
      const user = getThing(dataset, userId)
      if (user) {
        const updatedUser = addUrl(user, foaf.topic_interest, interest.uri)
        const changedDataset = setThing(dataset, updatedUser)
        await saveSolidDatasetAt(userId, changedDataset, { fetch: auth.fetch })
      }
    } else alert(`${interest.label} already added`)
  }

  const handleRemoveInterest = async (interest: Interest) => {
    const dataset = await getSolidDataset(userId, { fetch: auth.fetch })
    const user = getThing(dataset, userId)
    if (user) {
      const updatedUser = removeUrl(user, foaf.topic_interest, interest.uri)
      const changedDataset = setThing(dataset, updatedUser)
      await saveSolidDatasetAt(userId, changedDataset, { fetch: auth.fetch })
    }
    setUser(user => {
      const { [interest.uri]: _interest, ...interests } = user.interests
      return {
        ...user,
        interests,
      }
    })
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
      <Profile
        onAddInterest={handleAddInterest}
        onRemoveInterest={handleRemoveInterest}
        user={user}
      />
    </>
  )
}

export default ProfileContainer
