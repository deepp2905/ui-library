import { useState } from 'react'
import Toggle from './Toggle.jsx'
import Tile from './Tile.jsx'
import Counter from './Counter.jsx'

function App() {
  const [on, setOn] = useState(false)

  return (
    <>
      <Tile>
        <Toggle checked={on} onChange={setOn} />
      </Tile>
      <br/>
      <Tile>
        <Counter initial={0} />
      </Tile>
    </>
  )
}

export default App
