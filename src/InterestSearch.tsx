import React, { useEffect, useState } from 'react'
import debounce from 'debounce-promise'
import { searchInterestsWikidata, searchInterestsDBPedia } from './data'
import { Interest } from './Profile'

const debouncedSearchWikidata = debounce(searchInterestsWikidata, 30)
const debouncedSearchDBPedia = debounce(searchInterestsDBPedia, 30)

interface Props {
  onSelectInterest: (interest: Interest) => void
}

const InterestSearch: React.FC<Props> = ({ onSelectInterest }) => {
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Interest[]>([])
  const [source, setSource] = useState<'dbp' | 'wd'>('wd')

  useEffect(() => {
    ;(async () => {
      const output = await (source === 'wd'
        ? debouncedSearchWikidata
        : debouncedSearchDBPedia)(query)
      if (output) {
        setFound(output)
      }
    })()
  }, [query, source])

  const handleClickInterest = (interest: Interest) => {
    setQuery('')
    onSelectInterest(interest)
  }

  const handleSwitchSource = () => {
    setSource(current => (current === 'wd' ? 'dbp' : 'wd'))
  }

  return (
    <>
      <input
        type="text"
        className="input"
        placeholder="add interest"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button className="button" onClick={handleSwitchSource}>
        {source === 'wd' ? 'wikidata' : 'dbpedia'}
      </button>
      <ul>
        {found.map(interest => (
          <li key={interest.uri} onClick={() => handleClickInterest(interest)}>
            {interest.label}: {interest.description}
          </li>
        ))}
      </ul>
    </>
  )
}

export default InterestSearch
