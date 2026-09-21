import { Outlet } from "react-router"

import Nav from "./Nav"

function Layout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default Layout