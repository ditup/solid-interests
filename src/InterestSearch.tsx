import React, { useEffect, useState } from 'react'
import debounce from 'debounce-promise'
import { searchInterests } from './data'
import { Interest } from './Profile'

const debouncedSearch = debounce(searchInterests, 30)

interface Props {
  onSelectInterest: (interest: Interest) => void
}

const InterestSearch: React.FC<Props> = ({ onSelectInterest }) => {
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Interest[]>([])

  useEffect(() => {
    ;(async () => {
      const output = await debouncedSearch(query)
      if (output) {
        setFound(output)
      }
    })()
  }, [query])

  const handleClickInterest = (interest: Interest) => {
    setQuery('')
    onSelectInterest(interest)
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
