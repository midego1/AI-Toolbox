# Admin Settings - Comprehensive Guide

## Overview

The Admin Settings feature provides a comprehensive administration panel for managing the entire AI Toolbox platform. This powerful interface allows administrators to monitor system health, manage users, track usage, and perform various maintenance tasks.

## Features

### 🎯 Overview Dashboard
- **System Statistics**: Real-time metrics for users, jobs, credits, and subscriptions
- **User Distribution**: Visual breakdown by subscription tier
- **Jobs by Tool Type**: Detailed distribution of all job types
- **Recent Activity Feed**: Live stream of platform activity

### 👥 User Management
- **User Search**: Find users by email or name
- **User Details**: Comprehensive view of user information and activity
- **Credit Management**: 
  - Add credits to any user account
  - Set credits to specific amounts
  - View transaction history
- **Admin Controls**:
  - Grant/revoke admin privileges
  - Update subscription tiers
  - View user statistics (jobs, credits used, etc.)
- **User Statistics**:
  - Total jobs
  - Completed jobs
  - Failed jobs
  - Total credits used

### 💼 Job Management
- **Job Monitoring**: View all AI jobs across the platform
- **Filter Options**:
  - All jobs
  - Pending
  - Processing
  - Completed
  - Failed
- **Job Actions**:
  - Retry failed jobs
  - View detailed job information
  - Monitor job status in real-time

### 💳 Credit Management
- **Transaction Tracking**: View all credit transactions
- **Filter by Type**:
  - Tool usage
  - Subscriptions
  - Admin adjustments
  - Refunds
- **Transaction Details**:
  - User information
  - Amount
  - Type
  - Description
  - Timestamp

### 📊 Subscription Management
- **View All Subscriptions**: Complete list of active subscriptions
- **Subscription Details**:
  - User information
  - Stripe subscription ID
  - Tier
  - Status
  - Period dates
  - Cancelation status

### 📈 Analytics
- **Usage Analytics**: 
  - Daily breakdown of platform usage
  - Jobs per day
  - Credits used per day
  - Tool-specific metrics
- **Chat Analytics**:
  - Session counts
  - Message volumes
  - Average response times
  - Confidence scores
  - User ratings
- **Time Ranges**: 7, 30, or 90 days

### 🏥 System Health
- **Health Monitoring**:
  - Overall system status
  - Stuck jobs detection
  - Recent failure tracking
  - Expired session identification
- **Maintenance Actions**:
  - Reset stuck jobs
  - Cleanup expired sessions
  - System health indicators

## Access Control

### Admin Authentication
Only users with `isAdmin: true` in the database can access admin settings.

### Route Protection
The admin routes are protected at multiple levels:
1. **Layout Guard**: `/settings/admin/layout.tsx` checks admin status
2. **API Guard**: All admin Convex functions verify admin status
3. **UI Guard**: Admin navigation only visible to admin users

### Verification Flow
```typescript
// Check admin status
const user = await ctx.db.get(userId);
if (!user || !user.isAdmin) {
  throw new Error("Unauthorized: Admin access required");
}
```

## Database Schema

### User Schema Update
```typescript
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),
  name: v.optional(v.string()),
  subscriptionTier: v.string(),
  creditsBalance: v.number(),
  stripeCustomerId: v.optional(v.string()),
  isAdmin: v.optional(v.boolean()), // NEW: Admin flag
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

## API Functions

### User Management
- `getAllUsers` - Get paginated list of all users
- `searchUsers` - Search users by email or name
- `getUserDetails` - Get detailed user information
- `updateUserAdminStatus` - Grant/revoke admin privileges
- `updateUserTier` - Update subscription tier
- `addCreditsToUser` - Add credits to user account
- `setUserCredits` - Set credits to specific amount

### System Statistics
- `getSystemStats` - Get comprehensive system statistics
- `getRecentActivity` - Get recent activity feed

### Job Monitoring
- `getAllJobs` - Get all jobs with filters
- `getJobDetails` - Get detailed job information
- `retryJob` - Retry a failed job

### Credit Management
- `getAllTransactions` - Get all credit transactions

### Subscription Management
- `getAllSubscriptions` - Get all subscriptions

### Analytics
- `getUsageAnalytics` - Get usage analytics over time
- `getChatAnalytics` - Get chat analytics

### System Health
- `getSystemHealth` - Get system health metrics
- `cleanupExpiredSessions` - Remove expired sessions
- `resetStuckJobs` - Reset jobs stuck in processing

## UI Components

### Tab Navigation
The admin interface uses a tabbed layout with the following sections:
1. Overview
2. Users
3. Jobs
4. Credits
5. Subscriptions
6. Analytics
7. System Health

### Responsive Design
- Desktop: Full sidebar with all navigation
- Mobile: Collapsible sidebar with sheet component
- Responsive grids for stats and data displays

### Real-time Updates
All data is fetched using Convex's real-time queries, ensuring the admin dashboard always shows the latest information.

## Usage Examples

### Making a User Admin

1. Navigate to Settings → Admin Settings
2. Go to the "Users" tab
3. Search for the user by email
4. Click on the user to view details
5. Click "Make Admin" button
6. Confirm the action

### Adding Credits to a User

1. Go to Users tab
2. Select the user
3. Enter the credit amount in the input field
4. Click "Add" to add credits to their current balance
5. Or click "Set" to set their balance to the specified amount

### Monitoring System Health

1. Navigate to the "System Health" tab
2. Review the overall health status
3. Check for:
   - Stuck jobs
   - Recent failures
   - Expired sessions
4. Use maintenance actions to fix issues:
   - "Reset Stuck Jobs" to mark them as failed
   - "Cleanup Sessions" to remove expired sessions

### Viewing Analytics

1. Go to the "Analytics" tab
2. Select time range (7, 30, or 90 days)
3. Review:
   - Usage trends
   - Jobs per day
   - Credits consumed
   - Tool-specific metrics
   - Chat performance

## Security Considerations

### Admin Access
- Admin status must be manually set in the database
- No self-service admin promotion
- All admin actions are logged in transactions

### Data Privacy
- Admin can view all user data
- Exercise caution with sensitive information
- Follow data privacy regulations

### Audit Trail
- All credit adjustments are recorded
- Transaction history maintains admin actions
- User modifications are timestamped

## Deployment

### Initial Setup

1. **Update Schema**: 
   ```bash
   npx convex deploy
   ```

2. **Make First Admin**:
   Use Convex dashboard to manually set `isAdmin: true` on your user account:
   ```javascript
   // In Convex dashboard
   await ctx.db.patch(userId, { isAdmin: true })
   ```

3. **Verify Access**:
   - Log in to your account
   - Check sidebar for "Admin Settings" link
   - Navigate to admin panel

### Production Checklist

- [ ] Schema updated with `isAdmin` field
- [ ] At least one admin user created
- [ ] Admin routes tested
- [ ] Security verified (non-admins cannot access)
- [ ] Analytics and monitoring confirmed working
- [ ] System health checks functional

## Troubleshooting

### Can't See Admin Settings
- **Issue**: Admin link not appearing in sidebar
- **Solution**: Verify your user has `isAdmin: true` in database

### Unauthorized Errors
- **Issue**: Getting "Unauthorized: Admin access required"
- **Solution**: Check database to ensure `isAdmin` is set to `true`

### Data Not Loading
- **Issue**: Admin panel shows loading state
- **Solution**: 
  1. Check browser console for errors
  2. Verify Convex connection
  3. Ensure all admin functions are deployed

### Stuck Jobs Not Resetting
- **Issue**: Reset button not working
- **Solution**:
  1. Check job status in database
  2. Verify job has been processing for >1 hour
  3. Review error logs

## Best Practices

### User Management
- Regularly review user accounts
- Monitor credit usage patterns
- Address failed jobs promptly

### System Monitoring
- Check system health daily
- Review analytics weekly
- Clean up expired sessions regularly

### Credit Management
- Document credit adjustments
- Use descriptive transaction descriptions
- Monitor total credits issued vs. used

### Performance
- Limit query results for better performance
- Use filters to narrow down data
- Review analytics in appropriate time ranges

## Future Enhancements

Potential future additions to admin settings:
- Email notifications for system issues
- Automated credit adjustments based on subscriptions
- Advanced user analytics and insights
- Bulk user operations
- Export functionality for reports
- Custom role-based permissions
- API key management
- Rate limiting controls
- Custom branding settings

## Support

For issues or questions about admin settings:
1. Check this documentation
2. Review error logs
3. Check Convex dashboard for backend issues
4. Verify database state

## Version History

### v1.0.0 (Current)
- Initial admin settings implementation
- User management
- Job monitoring
- Credit management
- Subscription management
- Analytics dashboard
- System health monitoring
- Real-time updates
- Route protection
- Comprehensive UI

---

**Note**: Keep this documentation updated as you add new features or make changes to the admin interface.



