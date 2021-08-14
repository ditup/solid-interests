import { rdfs, schema } from 'rdf-namespaces'
import { Interest } from './Profile'
import * as N3 from 'n3'

const wikidataRegex =
  /^https?:\/\/(w{3}\.)?wikidata\.org\/entity\/([A-Z0-9]*)\/?$/

const fetchTurtle: typeof window.fetch = (...params) => {
  const [uri, options, ...rest] = params

  const headers = { accept: 'text/turtle', ...(options?.headers ?? {}) }

  return window.fetch(uri, { ...options, headers }, ...rest)
}

export const getInterest = async (uri: string): Promise<Interest> => {
  const id = uri.match(wikidataRegex)?.[2] ?? ''
  const dataUri = id
    ? `https://www.wikidata.org/wiki/Special:EntityData/${id}.ttl`
    : uri
  const rawData = await (await fetchTurtle(dataUri)).text()
  return await parseInterest(rawData, uri)
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
      let response = await window.fetch(queryGenerator(query), {
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

const parser = new N3.Parser()
const parseInterest = async (ttl: string, uri: string): Promise<Interest> => {
  const interest: Interest = { uri, description: '', label: '' }
  return new Promise((resolve, reject) => {
    parser.parse(ttl, (error, quad, prefixes) => {
      if (error) {
        return reject(error)
      } else if (quad) {
        if (quad.subject.id === uri) {
          if (
            quad.predicate.id === rdfs.label &&
            quad.object.termType === 'Literal' &&
            quad.object.language === 'en'
          ) {
            interest.label = quad.object.value
          }

          if (
            (quad.predicate.id === schema.description ||
              quad.predicate.id === rdfs.comment) &&
            quad.object.termType === 'Literal' &&
            quad.object.language === 'en'
          ) {
            interest.description = quad.object.value
          }
        }
      } else {
        return resolve(interest)
      }
    })
  })
}
