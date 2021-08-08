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

const fetchTurtle: typeof window.fetch = (...params) => {
  const [uri, options, ...rest] = params
  const headers = { accept: 'text/turtle', ...(options?.headers ?? {}) }
  const o = { ...options, headers }

  return window.fetch(uri, o, ...rest)
}

export const getInterest = async (uri: IriString): Promise<Interest> => {
  const id = uri.match(wikidataRegex)?.[2] ?? ''
  const dataUri = id
    ? `https://www.wikidata.org/wiki/Special:EntityData/${id}.ttl`
    : uri
  const dataset = await getSolidDataset(dataUri, { fetch: fetchTurtle })
  const data = getThing(dataset, uri)
  if (data) {
    const label = getStringWithLocale(data, rdfs.label, 'en') ?? ''
    const description =
      getStringWithLocale(data, schema.description, 'en') ??
      getStringWithLocale(data, rdfs.comment, 'en') ??
      ''
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

let abortController = new AbortController()

const searchInterestsFactory =
  <Body>(
    queryGenerator: (query: string) => string,
    dataMap: (body: Body) => Interest[],
  ) =>
  async (query: string) => {
    abortController.abort() // Cancel the previous request
    abortController = new AbortController()

    if (query.length === 0) {
      return []
    }

    try {
      let response = await fetch(queryGenerator(query), {
        signal: abortController.signal,
      })
      const data = (await response.json()) as Body

      return dataMap(data)
    } catch (ex) {
      if (ex.name === 'AbortError') {
        return // Continuation logic has already been skipped, so return normally
      }

      throw ex
    }
  }

type WikidataResponse = {
  search: { concepturi: string; description: string; label: string }[]
}

export const searchInterestsWikidata = searchInterestsFactory<WikidataResponse>(
  query =>
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query,
    )}&format=json&errorformat=plaintext&language=en&uselang=en&type=item&origin=*`,
  data =>
    data.search.map(({ concepturi: uri, description, label }) => ({
      uri,
      description,
      label,
    })),
)

type DBPediaResponse = {
  docs: { resource: [string]; label: [string] }[]
}

export const searchInterestsDBPedia = searchInterestsFactory<DBPediaResponse>(
  query =>
    `https://lookup.dbpedia.org/api/prefix?query=${encodeURIComponent(
      query,
    )}&format=json$`,
  data =>
    data.docs.map(({ resource: [uri], label: [label] }) => ({
      uri,
      description: '...',
      label,
    })),
)
