# @potatix/auth

authentication package for typescript projects that aren't complete garbage. wraps better-auth so you don't have to read their docs (but you should anyway).

## what this does

- provides server-side auth instance with email/password
- provides client-side auth hooks for react/next.js
- handles database schema with drizzle + postgres
- doesn't suck (unlike most auth implementations)

## server setup

### 1. environment variables

add these to your `.env` or you'll get runtime errors:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
BETTER_AUTH_SECRET=your-secret-key-here-make-it-long
BETTER_AUTH_URL=http://localhost:3000
```

### 2. create auth instance

```typescript
import { createAuth } from '@potatix/auth/server';
import { createDb } from '@potatix/db/client';

const db = createDb({
  databaseUrl: process.env.DATABASE_URL,
});

export const auth = createAuth({
  db,
  authSecret: process.env.BETTER_AUTH_SECRET!,
  webUrl: process.env.BETTER_AUTH_URL!,
});
```

### 3. setup api route handler

in next.js app router, create `/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth'; // your auth instance
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

### 4. generate database schema

run this command to create the auth tables:

```bash
pnpm auth:schema:generate
pnpm db:push
```

## client setup

### 1. create auth client

```typescript
// lib/auth-client.ts
import { createAuthClient } from '@potatix/auth/client';

export const authClient = createAuthClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 2. sign up users

```typescript
import { authClient } from '@/lib/auth-client';

const handleSignUp = async (email: string, password: string, name: string) => {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
    callbackURL: '/dashboard',
  });

  if (error) {
    console.error('signup failed:', error.message);
    return;
  }

  // user is automatically signed in
  console.log('user created:', data);
};
```

### 3. sign in users

```typescript
import { authClient } from '@/lib/auth-client';

const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
    callbackURL: '/dashboard',
    rememberMe: true,
  });

  if (error) {
    console.error('signin failed:', error.message);
    return;
  }

  console.log('signed in:', data);
};
```

### 4. use session hook

```typescript
import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <div>loading...</div>;
  if (error) return <div>error: {error.message}</div>;
  if (!session) return <div>not signed in</div>;

  return (
    <div>
      <p>welcome, {session.user.name}</p>
      <p>email: {session.user.email}</p>
      <button onClick={() => authClient.signOut()}>
        sign out
      </button>
    </div>
  );
}
```

## server-side session

get user session on the server:

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
```

use in server components:

```typescript
import { getServerSession } from "@/lib/auth-utils";

export default async function ProtectedPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  return <div>hello, {session.user.name}</div>;
}
```

## what's configured

- email/password authentication (enabled)
- auto sign-in after registration (enabled)
- email verification (disabled - enable in production)
- session cookie caching (5 min cache)
- postgres database with drizzle orm
- proper typescript types

## extending user data

don't touch `better-auth.ts` schema. use `user-profile.ts` instead:

```typescript
// in your app
import { userProfile } from '@potatix/db/schema';

// query user with profile
const userWithProfile = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    profile: true,
  },
});
```

## common mistakes

- forgetting to add environment variables
- not running schema generation
- calling client methods on server side
- not handling loading/error states
- hardcoding urls instead of using env vars

## troubleshooting

**"database connection failed"**

- check your `DATABASE_URL`
- make sure postgres is running

**"auth routes not found"**

- make sure you created the catch-all route handler
- check the file path is correct

**"session is null"**

- user might not be signed in
- check if auth cookies are being set
- check network tab for auth api calls

**"typescript errors"**

- run `pnpm typecheck` to see what's broken
- make sure you're importing from correct paths

## that's it

if you can't figure this out from here, maybe consider a different career path.
