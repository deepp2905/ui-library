import { useState } from 'react'
import { motion } from 'framer-motion'
import './Toggle.css'

const spring = { type: 'spring', stiffness: 500, damping: 26 }

function Toggle({ checked, onChange }) {
  const [pressed, setPressed] = useState(false)

  const release = () => setPressed(false)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className="toggle"
    >
      <motion.span className="toggle__thumb-wrap" layout transition={spring}>
        <motion.span
          className="toggle__thumb"
          animate={{ scale: pressed ? 0.9 : 1 }}
          transition={spring}
        />
      </motion.span>
    </button>
  )
}

export default Toggle
