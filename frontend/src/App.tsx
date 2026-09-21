import { RouterProvider } from 'react-router';

import './shared/styles/layout.scss'
import { router } from './shared/routes';

function App() {
  return <RouterProvider router={router} />
}

export default App
