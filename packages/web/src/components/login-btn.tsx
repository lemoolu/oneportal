'use client';

import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  // const { data: session } = useSession()
  // const session = await auth();

  // return (
  //   <>
  //     <button onClick={() => signOut()}>Sign out</button>
  //   </>
  // )
  return (
    <>
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  )
}