import { useUser } from "@civic/auth-web3/react";

export default function AuthButton() {
  const { user, signIn, signOut, isLoading } = useUser();

  if (isLoading) return <button disabled>Loading...</button>;

  return user ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={signIn}>Sign In with Civic</button>
  );
}
