# Data Model: Admin Dashboard and Session Management

## Entities

### AdminSession
- id: string
- adminId: string
- signedAt: ISO datetime
- expiresAt: ISO datetime
- userAgent?: string
- lastSeenAt: ISO datetime

### AdminUser
- id: string
- email?: string
- displayName: string
- role: 'admin'
- isActive: boolean
- createdAt: ISO datetime

### DashboardSummary
- pendingAppointments: number
- confirmedAppointments: number
- expiredAppointments: number
- activeServices: number
- lowStockItems: number
- generatedAt: ISO datetime

### InventoryAlert
- itemId: string
- itemName: string
- quantityAvailable: number
- minimumThreshold: number
- severity: 'warning' | 'critical'

### RouteAccessResult
- isAllowed: boolean
- reason?: 'missing-session' | 'expired-session' | 'denied-role' | 'invalid-user'
- redirectTo?: string

## Relationships

- One admin user owns one or more session records.
- One dashboard summary is derived from many appointments, services and supplies.
- One admin action can affect multiple records in the operational domain.

## Validation Rules

- A dashboard requires an active admin session to be shown.
- Expired session values must be rejected and redirected.
- Inventory warnings depend on supply quantity and thresholds.
- Summary counters should always reflect persisted business data, not stale UI state.
