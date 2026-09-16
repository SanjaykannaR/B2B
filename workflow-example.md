# Real-Time Workflow — End-to-End Example (Reference)

> Status: Approved by Admin (Owner) on 2026-08-06. Implementation begins 2026-08-07.
> This is the reference flow the backend must serve. It lives alongside `backend-admin-plan.md` (the build plan) and `todos.md` (the checklist).
> Roles: **Admin** = dispatcher/main page. **Client**, **Driver**, **Executive** are built by other team members and communicate through this flow.

---

## The Story

Admin is the main page — the dispatcher who decides what others do and creates the accounts for them to use.

### Step-by-step scenario (as described by Admin)

```
1.  Admin creates Client and Driver accounts          → Settings → Create Role-Based User
2.  Client logs in with their credentials              → redirected to /client
3.  Client places an order from their end              → order arrives in admin queue (status: Pending)
4.  Admin checks the order and gives approval          → approved / rejected / contacted
5.  Admin goes to the driver page, sees which driver
    is available, and sends a delivery request         → driver gets a notification
6.  Driver accepts the request, gets the goods in
    the truck, and updates on their end                → notification sent to Admin & Client:
                                                         "driver is ready to deliver the goods"
7.  Admin and Client track the traveling live          → live map (admin) + tracker (client)
8.  Driver completes the delivery and updates
    their end                                          → notification to Admin & Client:
                                                         "delivery successful"
9.  Invoice is generated automatically                 → visible to Client (and Admin)
```

### System messages sent at each step

| Step | Event | Notified |
|---|---|---|
| Client places order | "New client order awaiting approval" | Admin |
| Admin approves | "Your order #TRK-XXX was approved" | Client |
| Admin sends driver request | "New delivery request for #TRK-XXX" | Driver |
| Driver accepts | "Driver <name> assigned to #TRK-XXX" | Admin + Client |
| Driver loads + starts trip | "Driver is ready to deliver the goods" | Admin + Client |
| Driver completes | "Delivery of #TRK-XXX completed successfully" | Admin + Client |
| Invoice generated | "Invoice INV-XXX generated" | Client |

---

## What the backend must support (quick recap)

- **Admin creates role-based accounts** (client, driver, executive, admin) with email + password — the ONLY account-creation path. No public registration.
- **Client orders → admin approval queue** (`requestStatus`: PENDING → APPROVED / REJECTED / CONTACTED).
- **Admin dispatches: picks one available driver + vehicle → sends delivery request.** Driver accepts or declines.
- **Driver status updates**: load goods → "ready to deliver" → live GPS location pings → complete.
- **Live tracking**: admin map + client tracker poll the driver's latest location.
- **Delivery complete** → vehicle freed, invoice auto-generated, success notifications to admin + client.
- **Real-time**: REST + polling now; WebSocket later.

Full technical detail (endpoints, models, phases): see `backend-admin-plan.md`.
