import { createBrowserRouter } from "react-router";
import Layout from "./layout/Layout";
import FountainMap from "../features/map/FountainMap";
import About from "../features/about/About";
import Contact from "../features/contact/Contact";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FountainMap },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
]);