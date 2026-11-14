import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'

interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  breadcrumbs: Crumb[]
  title: ReactNode
  description?: ReactNode
  /** 오른쪽에 둘 요소 (단계 표시 등) */
  aside?: ReactNode
}

export default function PageHeader({ breadcrumbs, title, description, aside }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <nav aria-label="현재 위치">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
            {breadcrumbs.map((crumb, i) => (
              <Fragment key={crumb.label}>
                {i > 0 && <li aria-hidden>/</li>}
                <li>
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-neutral-800">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
      </div>
      {aside}
    </div>
  )
}
