import { LoginForm } from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export const metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
