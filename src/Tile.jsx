import './Tile.css'

function Tile({ children, className = '', ...rest }) {
  return (
    <div className={`tile ${className}`} {...rest}>
      {children}
    </div>
  )
}

export default Tile
