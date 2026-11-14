import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link to="/" className="text-lg font-bold text-brand-600">
            AdCanvas
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
