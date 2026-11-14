import { Link, Outlet, ScrollRestoration } from 'react-router'
import { CreateAdProvider } from '@/contexts/CreateAdContext'

export default function Layout() {
  return (
    <CreateAdProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
            <Link to="/" className="text-xl font-extrabold tracking-tight">
              AdCanvas
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </CreateAdProvider>
  )
}
