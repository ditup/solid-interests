import {
  getSolidDataset,
  getStringWithLocale,
  getThing,
  IriString,
} from '@inrupt/solid-client'
import { rdfs, schema } from 'rdf-namespaces'
import { Interest } from './Profile'

const wikidataRegex =
  /^https?:\/\/(w{3}\.)?wikidata\.org\/entity\/([A-Z0-9]*)\/?$/

export const getInterest = async (uri: IriString): Promise<Interest> => {
  const id = uri.match(wikidataRegex)?.[2] ?? ''
  const dataUri = `https://www.wikidata.org/wiki/Special:EntityData/${id}.ttl`
  const entityUri = `http://www.wikidata.org/entity/${id}`
  const dataset = await getSolidDataset(dataUri)
  const data = getThing(dataset, entityUri)
  if (data) {
    const label = getStringWithLocale(data, rdfs.label, 'en') ?? ''
    const description =
      getStringWithLocale(data, schema.description, 'en') ?? ''
    return {
      uri,
      label,
      description,
    }
  }
  return {
    uri,
    label: '',
    description: '',
  }
}
