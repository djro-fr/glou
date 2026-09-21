import { NavLink } from "react-router"

function NotFound() {
  return (
    <>
      <h1>Page inexistante</h1>
      <p>Retournez à l'<NavLink to='/'>accueil</NavLink></p>
    </>
  )
}

export default NotFound