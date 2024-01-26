
import Image from 'next/image'
import LoginBtn from '@/components/login-btn';
import { auth } from "@/common/auth"

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <div>
        session: {session?.user?.name}
      </div>
      <div>
        <LoginBtn />
      </div>
    </main>
  )
}
