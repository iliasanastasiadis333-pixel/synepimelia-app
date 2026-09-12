# 🚀 Co-Parenting App - Setup Guide

## Status: ✅ Environment Configured

Your `.env.local` is now configured with:
- ✅ Supabase Project URL
- ✅ Anon/Publishable Key
- ✅ Service Role Key
- ✅ JWKS URL

---

## Step 1: Apply Database Schema

The database schema is ready in `supabase/schema.sql`. You need to apply it manually via Supabase Dashboard.

### 🌐 Manual SQL Execution (Recommended)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/iueupmiotfzzwvjqmpcz
   ```

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left menu
   - Click "New Query" button

3. **Load and Execute Schema:**
   - Open file: `supabase/schema.sql`
   - Copy ALL content
   - Paste into the SQL Editor
   - Click "RUN" button (or Ctrl+Enter)

4. **Wait for completion:**
   - You should see: "Success. No rows returned"
   - Tables will appear in the "Tables" section on the left

### What Gets Created:

Tables:
- `cases` - Custody cases
- `custody_schedule` - Weekly parent assignments
- `custody_schedule_overrides` - Approved swaps
- `swap_requests` - Pending custody swaps
- `messages` - Parent communications
- `message_audit_trail` - Message history
- `expenses` - Shared child expenses
- `payment_history` - Payment records
- `child_info` - Child identification (ΑΜΚΑ, ΑΦΜ, ID)
- `emergency_contacts` - Pediatrician, school, tutor
- `documents` - Vaccination, court orders, insurance docs

Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic triggers for swap processing
- ✅ Message immutability enforcement
- ✅ Duplicate prevention policies

---

## Step 2: Verify Schema Installation

After applying the schema, verify it worked:

```bash
# Check if tables exist
node scripts/verify-schema.js
```

Or manually in Supabase Dashboard:
- Tables should appear in left sidebar
- RLS policies should show under each table
- Indexes should be created

---

## Step 3: Start Development Server

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Server starts at: **http://localhost:3000**

---

## Step 4: Test the Application

### Login Screen:
- Try **Demo Mode** button (🚀 Δοκιμαστική Είσοδος)
- Or sign up with any email/password

### Features to Test:
1. **Calendar** - View weekly custody schedule
2. **Swaps** - Request custody swaps
3. **Expenses** - Track shared expenses
4. **InfoBank** - Child personal information
5. **Messages** - Send messages with tone analysis

---

## Common Issues & Fixes

### Issue: "Table does not exist" error

**Solution:**
- Verify schema was applied (check Supabase Dashboard)
- Ensure SQL executed without errors
- Try applying schema again

### Issue: RLS permission denied

**Solution:**
- This is normal in development
- Ensure you're logged in via Supabase Auth
- For API testing, use the Service Role Key in headers

### Issue: Connection timeout

**Solution:**
- Check internet connection
- Verify Supabase URL is correct
- Try accessing Supabase Dashboard directly

---

## Environment Variables Reference

```bash
# Public - safe to share
NEXT_PUBLIC_SUPABASE_URL=https://iueupmiotfzzwvjqmpcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5vpOF0zKBnWI8AlWrIFDCg_pDYoplwf

# Secret - NEVER share or commit
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://iueupmiotfzzwvjqmpcz.supabase.co/auth/v1/.well-known/jwks.json

# AI Features
ANTHROPIC_API_KEY=your_key_here (optional for tone analysis)
```

### ⚠️ SECURITY WARNING:
- Never commit `.env.local` to git
- Never share the Service Role Key
- Keep credentials in `.env.local` only (local machine)

---

## Useful Supabase Links

- **Supabase Dashboard:** https://app.supabase.com/project/iueupmiotfzzwvjqmpcz
- **SQL Editor:** https://app.supabase.com/project/iueupmiotfzzwvjqmpcz/sql
- **Table Editor:** https://app.supabase.com/project/iueupmiotfzzwvjqmpcz/editor
- **Auth Users:** https://app.supabase.com/project/iueupmiotfzzwvjqmpcz/auth/users
- **Policies:** https://app.supabase.com/project/iueupmiotfzzwvjqmpcz/auth/policies

---

## API Routes

The app includes several API routes for backend operations:

```
POST   /api/messages/send              - Send message with tone analysis
POST   /api/calendar/swap-request      - Create swap request
PUT    /api/calendar/swap-request/:id/respond - Respond to swap request
```

All routes require authentication via Bearer token.

---

## Next Steps

1. ✅ Apply `schema.sql` to Supabase
2. ✅ Start dev server: `npm run dev`
3. ✅ Test Demo Mode at http://localhost:3000
4. ✅ Create test case with real auth user
5. 📊 Monitor RLS policies for access control

---

## Support

For issues:
1. Check Supabase project status
2. Verify credentials in `.env.local`
3. Review browser console for errors
4. Check Supabase SQL Editor for schema status

Good luck! 🎉
