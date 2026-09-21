import { NavLink } from "react-router"

function Nav() {

  return (
    <nav>
      <ul>
        <li><NavLink to="/">Accueil</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
        <li><NavLink to="/about">À Propos</NavLink></li>
      </ul>
    </nav>
  )
}

export default Nav
