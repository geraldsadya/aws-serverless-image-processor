import { Link } from "react-router-dom"
import "./Header.css"

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          Image Processor
        </Link>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Gallery
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/upload" className="nav-link">
                Upload
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
