import { createBrowserRouter } from 'react-router'
import Layout from '@/components/layout/Layout'
import CreatePage from '@/pages/create/CreatePage'
import GeneratingPage from '@/pages/create/GeneratingPage'
import ResultPage from '@/pages/create/ResultPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'create',
        children: [
          { index: true, element: <CreatePage /> },
          { path: 'generating', element: <GeneratingPage /> },
          { path: 'result', element: <ResultPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
