# Admin Routes Manual Patch Guide

This file provides exact changes needed for `server/routes/admin.ts` to complete the production implementation.

## Change 1: Add JWT Import

**Location:** Line 2 (after `import rateLimit from 'express-rate-limit';`)

**Add:**
```typescript
import jwt from 'jsonwebtoken';
```

**Result:**
```typescript
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';  // ← ADD THIS LINE
import { db } from '../db';
```

---

## Change 2: Update /verify-pin Endpoint

**Location:** Lines 30-49

**Find:**
```typescript
router.post('/verify-pin', verifyPinRateLimiter, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;

        if (!userEmail || !pin) {
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('PIN verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
```

**Replace with:**
```typescript
router.post('/verify-pin', verifyPinRateLimiter, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;
        const userId = ((req as unknown) as AuthRequest).userId;  // ← ADD THIS LINE

        if (!userEmail || !pin || !userId) {  // ← MODIFY THIS LINE
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        // ← ADD THESE LINES START
        // Generate Admin Session JWT Token
        const adminToken = jwt.sign(
            { 
                userId, 
                email: userEmail, 
                role: 'admin', 
                adminSession: true 
            },
            process.env.JWT_SECRET!,
            { expiresIn: '2h' } // 2-hour admin session
        );

        res.json({ success: true, adminToken });  // ← MODIFY THIS LINE
        // ← ADD THESE LINES END
    } catch (error) {
        console.error('PIN verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
```

**Summary of changes:**
1. Add `userId` extraction
2. Add `userId` to validation check
3. Generate JWT token with admin session
4. Return `adminToken` in response

---

## Change 3: Update /users/:userId/suspend Endpoint

**Location:** Lines 132-149

**Find:**
```typescript
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        // In a real app, we'd have a suspended flag or status
        // For now, we'll just log the action

        await db.insert(adminActions).values({
            adminUserId: Number(((req as unknown) as AuthRequest).userId!),
            action: 'suspend_user',
            targetUserId: userId,
            details: { reason: req.body.reason }
        });

        res.json({ success: true, message: 'User suspended (logged)' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});
```

**Replace with:**
```typescript
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const { reason } = req.body;  // ← ADD THIS LINE
        const adminUserId = Number(((req as unknown) as AuthRequest).userId!);  // ← ADD THIS LINE

        // ← ADD THESE LINES START
        // Update user suspended status in database
        await db.update(users)
            .set({
                suspended: true,
                suspendedAt: new Date(),
                suspendedReason: reason || 'Account suspended by administrator'
            })
            .where(eq(users.id, userId));
        // ← ADD THESE LINES END

        // Log the admin action
        await db.insert(adminActions).values({
            adminUserId,  // ← MODIFY THIS LINE
            action: 'suspend_user',
            targetUserId: userId,
            details: { reason }  // ← MODIFY THIS LINE
        });

        res.json({ success: true, message: 'User suspended successfully' });  // ← MODIFY THIS LINE
    } catch (error) {
        console.error('Error suspending user:', error);  // ← ADD THIS LINE
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});
```

**Summary of changes:**
1. Extract `reason` and `adminUserId` variables
2. Add database update to set `suspended`, `suspendedAt`, `suspendedReason`
3. Use extracted variables in adminActions insert
4. Update success message
5. Add error logging

---

## Verification

After making these changes:

1. **Check imports are correct**
2. **Verify JWT secret is in environment** (`process.env.JWT_SECRET`)
3. **Test PIN verification returns token**
4. **Test user suspension updates database**

## Quick Test Commands

```bash
# Compile to check for errors
cd server && npm run build

# If successful, restart server
npm run dev
```

---

## What These Changes Do

1. **JWT Import**: Enables JWT token generation for admin sessions
2. **verify-pin**: Returns a2-hour session token that frontend stores
3. **suspend**: Actually suspends users in database instead of just logging

All "for now" comments are now removed with production implementations!
