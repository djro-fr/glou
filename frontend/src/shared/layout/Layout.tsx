import { Outlet, useLocation } from "react-router"

import './Layout.scss'

import Nav from "./Nav"

function Layout() {
  const location = useLocation();
  const isMapPage = location.pathname === '/';
  
  return (
    <>
      <Nav />
      <main className={isMapPage ? 'map-page' : ''}>
        <Outlet />
      </main>
    </>
  )
}

export default Layout