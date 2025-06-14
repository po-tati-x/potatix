# lib directory

clean architecture for potatix /lib. no enterprise cancer, no barrel exports, just proper separation.

## data flow

```
database → services → api routes → client hooks → components
```

simple. services handle business logic, api routes handle http, client hooks manage state.

## directories

### server/ (server-only code)
- `services/` - business logic, database operations
- `middleware/` - request processing (auth, cors, subdomain routing)
- `utils/` - server-only utilities (mux, r2, auth helpers)

### client/ (browser-only code)
- `api/` - react query hooks for data fetching
- `hooks/` - custom react hooks for reusable logic
- `providers/` - react context providers (query client, analytics)

### shared/ (universal code)
- `types/` - typescript definitions for domain models
- `utils/` - pure functions (formatting, css, validation)
- `constants/` - query keys, app constants
- `events/` - event bus for component communication

## adding features

### 1. new domain entity (e.g., "assignments")

```bash
# server side
touch server/services/assignments.ts     # business logic
touch shared/types/assignments.ts       # type definitions

# client side
touch client/api/assignments.ts         # react query hooks
```

### 2. new api endpoint

```bash
# 1. add service function
echo "export const assignmentService = { ... }" >> server/services/assignments.ts

# 2. create api route
touch ../../app/api/assignments/route.ts

# 3. add client hook
echo "export function useAssignments() { ... }" >> client/api/assignments.ts
```

### 3. new middleware

```bash
touch server/middleware/rate-limit.ts
# add to middleware stack in app
```

## import rules

### ✅ correct imports
```typescript
// from client code
import { courseService } from '@/lib/server/services/courses'     // ❌ no
import { useCourses } from '@/lib/client/api/courses'            // ✅ yes
import { Course } from '@/lib/shared/types/courses'              // ✅ yes

// from server code
import { courseService } from '@/lib/server/services/courses'    // ✅ yes
import { getMuxAssetId } from '@/lib/server/utils/mux'          // ✅ yes
import { Course } from '@/lib/shared/types/courses'             // ✅ yes
```

### 🚫 never import
- server code from client (breaks builds)
- client code from server (unnecessary)
- relative imports across directories

## common patterns

### service function
```typescript
// server/services/courses.ts
export const courseService = {
  async getCourseById(id: string) {
    const course = await db.select().from(courseSchema.course)...
    return course;
  }
}
```

### api route
```typescript
// app/api/courses/route.ts
import { courseService } from '@/lib/server/services/courses'

export async function GET() {
  const courses = await courseService.getAllCourses()
  return Response.json(courses)
}
```

### client hook
```typescript
// client/api/courses.ts
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all(),
    queryFn: () => fetch('/api/courses').then(r => r.json())
  })
}
```

### middleware
```typescript
// server/middleware/auth.ts
export function authMiddleware() {
  return async (request: NextRequest) => {
    // auth logic
    return NextResponse.next()
  }
}
```

## query keys

all query keys live in `shared/constants/query-keys.ts`. use the factories:

```typescript
import { courseKeys } from '@/lib/shared/constants/query-keys'

// in hooks
queryKey: courseKeys.all()           // ['courses']
queryKey: courseKeys.detail('123')   // ['courses', '123']
```

## types

domain types in `shared/types/`. ui-specific types can extend domain types:

```typescript
// shared/types/courses.ts - domain model
export interface Course {
  id: string
  title: string
}

// shared/types/ui.ts - ui extensions
export interface UICourse extends Course {
  isExpanded?: boolean
}
```

that's it. keep it simple, avoid overengineering.
