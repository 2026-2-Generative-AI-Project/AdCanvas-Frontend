import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="space-y-3 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없어요</h1>
      <Link to="/" className="text-brand-600 underline">
        홈으로 돌아가기
      </Link>
    </section>
  )
}
