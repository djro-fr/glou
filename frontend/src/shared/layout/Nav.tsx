import { NavLink } from "react-router"
import IconSprite from "../components/IconSprite"

import './Nav.scss'

function Nav() {

  return (
    <>
      <IconSprite />
      <nav id='main-nav'>
        <ul>
          <li>
            <NavLink to="/">
              <svg><use href="#MapSVG" /></svg>
              <p>Accueil</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact">
              <svg><use href="#ContactSVG" /></svg>
              <p>Contact</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/about">
              <svg><use href="#AboutSVG" /></svg>
              <p>À Propos</p>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default Nav
