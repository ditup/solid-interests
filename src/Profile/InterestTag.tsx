import React from 'react'
import { Interest } from '.'

interface Props {
  interest: Interest
  onClose: () => void
}

const InterestTag: React.FC<Props> = ({ interest, onClose }) => (
  <div className="tags has-addons">
    <a
      title={interest.description}
      className={`tag is-link${interest.pending ? ' is-light' : ''}`}
      href={interest.uri}
    >
      {interest.label}
    </a>
    <button
      disabled={!!interest.pending}
      onClick={() => onClose()}
      className="tag is-delete"
    ></button>
  </div>
)

export default InterestTag
