import { Link } from 'react-router'
import { buttonClass } from '@/components/ui/Button'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle('AdCanvas')

  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-3xl leading-snug font-bold tracking-tight sm:text-4xl">
        사진 한 장으로
        <br />
        우리 가게 광고를 만들어요
      </h1>
      <p className="mt-4 text-neutral-500">
        상품 사진을 올리고 원하는 광고를 설명하면, 상품은 그대로 두고 배경과 문구를 새로 만들어
        드려요.
      </p>
      <Link to="/create" className={buttonClass('primary', 'mt-8 h-12 px-8')}>
        광고 만들기 시작하기 →
      </Link>
    </section>
  )
}
