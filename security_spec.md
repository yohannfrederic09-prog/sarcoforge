# Security Specification for SarcoForge FireStore Security

This specification outlines the data invariants, adversarial attack payloads ("Dirty Dozen"), and security rules validation for the SarcoForge application backend.

## 1. Data Invariants

1. **Identity Lock**: A user can only read, write, or touch their own user profile document. `/users/{userId}` must have `userId` matching `request.auth.uid`.
2. **Immutability of Core Identifiers**: Once set, the parent `userId` matching the document path key cannot be modified or updated to reference different users.
3. **Type and Scale Validation**: Numeric metrics like level and experience points (`xp`, `xpNeeded`) must restrict their structures to valid, non-negative numbers to prevent infinite level exploits.
4. **PII Isolation**: Complete list queries to search directories of users must be strictly bounded to prevent scanning other athletes' private email addresses.
5. **No Orphan Workouts**: Workouts saved under `users/{userId}/workouts/{workoutId}` must belong strictly to the authenticated user owning the parent `userId` namespace.

---

## 2. The "Dirty Dozen" Attack Payloads

Below are the 12 specific JSON payloads designed to test validation bounds and verify that the security engine returns `PERMISSION_DENIED`.

### Attack 01: Identity Spoofing (Create path mismatch)
A user authenticated as `uid_alice` attempts to register a profile under `uid_bob`.
```json
{
  "userId": "uid_bob",
  "displayName": "Alice Spoofing Bob",
  "email": "alice@gmail.com"
}
```

### Attack 02: Shadow Field Injection
An attacker attempts to inject a hidden administrative toggle `isAdmin` into their user record.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "isAdmin": true
}
```

### Attack 03: Experience Points Level Overflow
An attacker tries to inject infinite experience points to falsely claim the top level.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "xp": 9999999999,
  "level": 1000
}
```

### Attack 04: Invalid XP Type Attack (Value Poisoning)
An attacker attempts to set their Level to a boolean `true` to crash numerical aggregations.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "level": "INFINITE"
}
```

### Attack 05: Orphaned Workout Session
An attacker authenticated as `uid_alice` attempts to insert a workout record into `uid_bob`'s workout history.
```json
{
  "sessionId": "session_001",
  "userId": "uid_bob",
  "name": "Malicious session",
  "date": "2026-06-07",
  "completed": true
}
```

### Attack 06: Email Mutation after Authentication
An attacker matching `uid_alice` tries to update their email to match an existing registered administrator.
```json
{
  "userId": "uid_alice",
  "displayName": "Alice",
  "email": "admin@sarcoforge.com"
}
```

### Attack 07: Denial-of-Wallet Resource Poisoning (Giant ID)
An attacker sends a registration where the document ID contains 2 Kilobytes of text to waste Firestore lookup cycles.
`Target ID: abcdef...[2KB]`

### Attack 08: Missing Required Key Bounds
Attempts to create a User profile record without providing the mandatory `userId` anchor.
```json
{
  "displayName": "Missing ID User",
  "email": "missing@gmail.com"
}
```

### Attack 09: Timestamp Hijacking
Inserting a future timestamp inside historical logs instead of the server-controlled synchronized state.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "updatedAt": "2126-06-07T00:00:00Z"
}
```

### Attack 10: Unauthorized Profile Scrapes (Blanket Querying)
A standard authenticated user attempts to run a query listing all user profile records to harvest emails.
`Query: getDocs(collection(db, "users"))`

### Attack 11: Spoofed OAuth Avatar Origin
An attacker attempts to set their profile photo URL to point to a dangerous cross-origin script instead of a secure image CDN.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "photoURL": "javascript:alert('attack')"
}
```

### Attack 12: Invalid Challenge Increment Mutation
An attacker attempts to mark challenges complete client-side by overwriting the completion array with random string configurations.
```json
{
  "userId": "uid_alice",
  "email": "alice@gmail.com",
  "challenges": "ALL_COMPLETED"
}
```

---

## 3. The Test Runner

All of the payloads listed above are evaluated against the Firestore Emulator or Security rules checker during continuous integration tests to guarantee that un-authorized or malformed payloads receive `PERMISSION_DENIED`.
