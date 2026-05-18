import { Suspense } from 'react'
import OrdersPage from './pages/Orders'
import MenuSectionSkeleton from '@/components/ui/MenuSectionSkeleton'

const page = () => {
  return (
    <Suspense fallback={<MenuSectionSkeleton />}>
      <OrdersPage />
    </Suspense>
  )
}

export default page
