import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Counter.css'

const buttonSpring = { type: 'spring', stiffness: 500, damping: 18 }
const digitTransition = { type: 'spring', stiffness: 500, damping: 32, mass: 0.6 }

function Digit({ char }) {
  return (
    <span className="counter__digit">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          className="counter__digit-char"
          initial={{ filter: 'blur(10px)', opacity: 0, y: -12 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          exit={{ filter: 'blur(10px)', opacity: 0, y: 12 }}
          transition={digitTransition}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Counter({ value: controlled, onChange, initial = 0 }) {
  const [internal, setInternal] = useState(initial)
  const value = controlled ?? internal

  const set = (next) => {
    if (controlled === undefined) setInternal(next)
    onChange?.(next)
  }

  const negative = value < 0
  const absStr = Math.abs(value).toString()

  const items = []
  if (negative) items.push({ key: 'sign', char: '−' })
  for (let i = 0; i < absStr.length; i++) {
    const positionFromRight = absStr.length - 1 - i
    items.push({ key: `d${positionFromRight}`, char: absStr[i] })
  }

  return (
    <div className="counter">
      <motion.button
        type="button"
        className="counter__btn"
        onClick={() => set(value - 1)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06 }}
        transition={buttonSpring}
        aria-label="Decrement"
      >
        <span className="counter__btn-icon">−</span>
      </motion.button>

      <div className="counter__value" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map(({ key, char }) => (
            <motion.span
              key={key}
              layout
              className="counter__slot"
              initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.6 }}
              animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
              exit={{ filter: 'blur(10px)', opacity: 0, scale: 0.6 }}
              transition={digitTransition}
            >
              <Digit char={char} />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        className="counter__btn"
        onClick={() => set(value + 1)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06 }}
        transition={buttonSpring}
        aria-label="Increment"
      >
        <span className="counter__btn-icon">+</span>
      </motion.button>
    </div>
  )
}

export default Counter
