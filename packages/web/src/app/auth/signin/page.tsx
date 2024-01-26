'use client';
import { getProviders, signIn } from "next-auth/react"
import { useEffect } from "react";
import { useAsyncEffect, useSetState } from 'ahooks';

export default function SignIn() {
  const [state, setState] = useSetState({
    providers: [],
  });

  useAsyncEffect(async () => {
    const providers = await getProviders();
    console.log('providers', providers)
    setState({ providers });
  }, [])

  return (
    <div>
      {Object.values(state.providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  )
}