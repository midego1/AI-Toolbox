# Admin Settings - Quick Reference

## Quick Access
Navigate to: **Settings → Admin Settings** (visible only to admins)

## Common Tasks

### ⚡ Quick Actions

#### Make Someone Admin
```
Users Tab → Search user → Select → "Make Admin"
```

#### Add Credits
```
Users Tab → Select user → Enter amount → "Add" button
```

#### Set Credits
```
Users Tab → Select user → Enter amount → "Set" button
```

#### Retry Failed Job
```
Jobs Tab → Filter "Failed" → Find job → Click retry icon
```

#### Cleanup System
```
System Health Tab → "Cleanup Sessions" or "Reset Stuck Jobs"
```

## Tab Overview

| Tab | Purpose | Key Actions |
|-----|---------|-------------|
| **Overview** | System dashboard | View stats, recent activity |
| **Users** | User management | Search, edit, manage credits |
| **Jobs** | Job monitoring | View, filter, retry jobs |
| **Credits** | Transaction tracking | View all credit movements |
| **Subscriptions** | Subscription management | Monitor active subscriptions |
| **Analytics** | Usage insights | View trends, metrics |
| **System Health** | Health monitoring | Cleanup, maintenance |

## Statistics Cards

### Overview Tab Stats
- **Total Users**: All registered users (+new this week)
- **Total Jobs**: All AI jobs (completed count)
- **Credits Used**: Total consumed (remaining balance)
- **Active Subs**: Current subscriptions (of total)

### User Details Stats
- **Total Jobs**: All jobs by user
- **Completed**: Successfully finished jobs
- **Failed**: Jobs that failed
- **Credits Used**: Total credits consumed

## Filters

### Jobs Tab
- All
- Pending
- Processing
- Completed
- Failed

### Credits Tab
- All
- Tool Usage
- Subscription
- Admin

### Analytics Tab
- 7 Days
- 30 Days
- 90 Days

## Color Coding

### Status Badges
- 🟢 **Green** (Default): Completed, Active, Healthy
- 🔴 **Red** (Destructive): Failed, Canceled, Error
- ⚪ **Gray** (Secondary): Pending, Processing, Inactive

### Admin Indicators
- 🔴 **Red Badge**: Admin user
- 🛡️ **Shield Icon**: Admin settings link
- 🔴 **Red Text**: Admin-related items

## System Health Indicators

### Overall Health
- ✅ **Healthy**: System operating normally
- ⚠️ **Needs Attention**: Issues detected

### Problem Areas
- **Stuck Jobs**: Processing >1 hour
- **Recent Failures**: Failed jobs in last 24h
- **Expired Sessions**: Sessions needing cleanup

## API Functions Reference

### User Management
```typescript
getAllUsers({ token, limit?, offset? })
searchUsers({ token, searchTerm })
getUserDetails({ token, userId })
updateUserAdminStatus({ token, userId, isAdmin })
updateUserTier({ token, userId, tier })
addCreditsToUser({ token, userId, amount, description? })
setUserCredits({ token, userId, amount })
```

### System Operations
```typescript
getSystemStats({ token })
getRecentActivity({ token, limit? })
getSystemHealth({ token })
```

### Job Management
```typescript
getAllJobs({ token, status?, limit? })
getJobDetails({ token, jobId })
retryJob({ token, jobId })
```

### Monitoring
```typescript
getAllTransactions({ token, limit?, type? })
getAllSubscriptions({ token })
getUsageAnalytics({ token, days? })
getChatAnalytics({ token, days? })
```

### Maintenance
```typescript
cleanupExpiredSessions({ token })
resetStuckJobs({ token })
```

## Keyboard Shortcuts

Currently no keyboard shortcuts implemented. Potential additions:
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + 1-7`: Switch tabs
- `Esc`: Close modals/panels

## Search Tips

### User Search
- Type at least 3 characters
- Searches in email and name
- Results appear instantly
- Case-insensitive

### Job Filtering
- Use status filters for quick access
- Limit shows last 100 by default
- Most recent jobs first

## Credit Management Tips

### Adding Credits
- Positive numbers only
- Transaction logged automatically
- Adds to current balance
- Immediate effect

### Setting Credits
- Can set to any amount (including 0)
- Use for corrections
- Transaction shows difference
- Immediate effect

## Warning Signs

### 🚨 Red Flags
- Failure rate >10%
- Many stuck jobs
- Unusual credit patterns
- Many expired sessions

### 📊 Monitor Closely
- Rapid user growth
- Sudden spike in jobs
- High failure rate
- Low credit balances

## Best Practices

### Daily Tasks
- ✅ Check system health
- ✅ Review recent failures
- ✅ Monitor user activity

### Weekly Tasks
- ✅ Review analytics
- ✅ Cleanup expired sessions
- ✅ Check stuck jobs
- ✅ Review subscription status

### Monthly Tasks
- ✅ Analyze usage trends
- ✅ Review credit patterns
- ✅ User account audit
- ✅ Performance review

## Emergency Procedures

### System Slow
1. Check System Health tab
2. Look for stuck jobs
3. Reset stuck jobs if needed
4. Monitor for improvement

### Many Failed Jobs
1. Go to Jobs tab
2. Filter by Failed
3. Check error messages
4. Retry if appropriate
5. Investigate root cause

### User Can't Use Service
1. Search user in Users tab
2. Check credit balance
3. Check subscription status
4. Add credits if needed
5. Verify account status

## Quick Fixes

| Problem | Solution |
|---------|----------|
| User out of credits | Add credits via Users tab |
| Job stuck | Reset via System Health |
| Session expired | Cleanup via System Health |
| Failed job | Retry via Jobs tab |
| Need user data | Search in Users tab |

## Troubleshooting One-Liners

```bash
# Can't see admin panel
Check: user.isAdmin === true in database

# Unauthorized error
Verify: Database has isAdmin field set to true

# Data not loading
Check: Convex connection, browser console

# Action not working
Try: Refresh page, check network tab

# Stats seem wrong
Refresh: Data updates in real-time via Convex
```

## Pro Tips

1. **Use Search**: Faster than scrolling through lists
2. **Filter Jobs**: Narrow down to what you need
3. **Check Health First**: Start with System Health tab
4. **Monitor Activity**: Recent Activity shows real-time events
5. **Document Changes**: Add descriptions when adjusting credits
6. **Regular Maintenance**: Weekly cleanup prevents issues
7. **Watch Analytics**: Trends reveal issues early
8. **Bookmark Admin Page**: Quick access to admin tools

## Support Contact

For admin-specific issues:
1. Check error in browser console
2. Review Convex dashboard logs
3. Check database directly
4. Verify deployment status

## Security Reminders

- 🔒 Never share admin credentials
- 🔒 Log out when done
- 🔒 Review audit trails regularly
- 🔒 Monitor admin actions
- 🔒 Limit admin users to trusted individuals
- 🔒 Use strong authentication

## Resources

- Full Documentation: `ADMIN_SETTINGS_GUIDE.md`
- Schema Reference: `convex/schema.ts`
- API Functions: `convex/adminTools.ts`
- UI Component: `src/app/(dashboard)/settings/admin/page.tsx`

---

**Last Updated**: 2025-10-26  
**Version**: 1.0.0



