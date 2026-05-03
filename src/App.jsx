import { useState } from 'react'
import Toggle from './Toggle.jsx'
import Tile from './Tile.jsx'

function App() {
  const [on, setOn] = useState(false)

  return (
    <Tile>
      <Toggle checked={on} onChange={setOn} />
    </Tile>
  )
}

export default App
