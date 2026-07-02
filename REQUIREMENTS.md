# Smile Link Social Media Management System

## Project Overview
An internal web app to run the monthly social media content cycle for Smile Link Dental Laboratory. The marketing manager sets the monthly content direction and manages users. The social media manager builds the monthly content plan and reviews finished creative. Graphic designers and videographers pick up assigned pieces, produce them, and submit a link. Everything is visible on a shared content calendar.

## Tech Stack
Match my existing stack so the code stays consistent with my other projects.

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (local for development)
- Prisma 6 (ORM and migrations)
- Auth.js (NextAuth) with a credentials provider (email plus password)
- Role based access control on both server actions and UI

## Brand and Design
Use the Smile Link brand colors across the entire system. Primary, secondary, and accent are defined below. Apply them to the sidebar, buttons, status badges, calendar highlights, and headers.

```
PRIMARY:    #00594f______   (fill from brand kit)
SECONDARY:  #c07d59______
NEUTRAL/BG: #FFFFFF
```

Design direction: clean, professional, high contrast, generous spacing. Rounded cards, soft shadows. The calendar and status badges should read at a glance. Put the Smile Link logo in the sidebar and on the login screen.

## User Roles
Four roles. The marketing manager is the admin.

| Role | Can do |
| --- | --- |
| MARKETING_MANAGER (admin) | Create and manage all users. Set the monthly content direction. View reports and analytics. Read access to everything. |
| SOCIAL_MEDIA_MANAGER | Create and edit content pieces. Assign pieces to a designer or videographer. Review submitted creative (approve or reject with comment). Full calendar view. Read the monthly direction. |
| GRAPHIC_DESIGNER | See pieces assigned to them where format is DESIGN. Submit the creative link. See rejection comments and resubmit. |
| VIDEOGRAPHER | Same as designer but for pieces where format is VIDEO. |

Only the marketing manager creates users. Seed the first marketing manager account (see Seed below) since it cannot be created from inside the app.

## Data Models

### User
- id
- name
- email (unique)
- passwordHash
- role (enum: MARKETING_MANAGER, SOCIAL_MEDIA_MANAGER, GRAPHIC_DESIGNER, VIDEOGRAPHER)
- isActive (boolean)
- createdAt, updatedAt

### MonthlyDirection
The theme and guidance the marketing manager sets each month for the social media manager.
- id
- month (e.g. 2026-07, one record per month)
- theme (short title)
- direction (long text: focus, tone, priorities for the month)
- createdById (marketing manager)
- createdAt, updatedAt

### ContentPiece
The core card in the plan.
- id
- title
- contentType (enum or string: REEL, CAROUSEL, SINGLE_POST, STORY)
- format (enum: DESIGN, VIDEO) — this decides whether it can be assigned to a designer or a videographer
- caption (long text)
- brief (long text: the direction of creation for the creator)
- scheduledDate (date the post is planned for)
- status (enum, see workflow below)
- monthlyDirectionId (links the piece to its month)
- assignedToId (nullable, the designer or videographer)
- creativeLink (nullable, the finished asset link submitted by the creator)
- createdById (social media manager)
- createdAt, updatedAt

### ReviewLog
History of each approve or reject action so comments are not lost across revisions.
- id
- contentPieceId
- reviewerId (social media manager)
- decision (enum: APPROVED, REJECTED)
- comment (text)
- createdAt

## Content Workflow (status flow)
ContentPiece.status moves through this state machine.

1. PLANNED — social media manager created it, not yet assigned.
2. ASSIGNED — assigned to a designer or videographer (assignedToId set).
3. IN_PROGRESS — creator has started (optional, creator can toggle).
4. SUBMITTED — creator has added the creativeLink and submitted for review.
5. Review by social media manager:
   - Approve → APPROVED. The piece now shows on the calendar with its link.
   - Reject → NEEDS_REVISION with a comment. Goes back to the creator, who fixes and resubmits (back to SUBMITTED).

Rules:
- A DESIGN piece can only be assigned to a GRAPHIC_DESIGNER. A VIDEO piece can only be assigned to a VIDEOGRAPHER.
- Only the assigned creator can submit a link for their piece.
- Only the social media manager can approve or reject.
- Every approve or reject writes a ReviewLog entry.

## Pages and Views

### Shared
- Login page (email plus password, Smile Link logo).
- Role aware dashboard after login.

### Calendar
- Month grid view of content pieces by scheduledDate.
- Cards color coded by status (planned, assigned, submitted, approved, needs revision).
- Approved pieces show the creative link on the card.
- Social media manager and marketing manager see all pieces. Creators see the full calendar but their assigned pieces are highlighted.

### Social Media Manager
- Create and edit content pieces (form with all ContentPiece fields).
- Assign a piece to a designer or videographer.
- Review queue: list of SUBMITTED pieces with the link, approve or reject with comment.
- Read the current monthly direction.

### Graphic Designer and Videographer
- My Tasks: list of pieces assigned to them, grouped by status.
- Open a piece, read the brief, mark in progress, paste the creative link, submit.
- See rejection comments and resubmit.

### Marketing Manager
- Set or edit the monthly direction.
- Reports and analytics (see below).
- User management: create, edit, deactivate users and assign roles.

## Reports (Marketing Manager)
For a selected month:
- Total pieces planned vs approved vs published.
- Breakdown by contentType and by format.
- Approval rate and average number of revisions per piece.
- Output per creator (pieces completed by each designer and videographer).
- On time rate (approved on or before scheduledDate).

## Authentication and Access
- Auth.js credentials provider, passwords hashed with bcrypt.
- Enforce role permissions in server actions and API routes, not only in the UI.
- Redirect unauthorized access.

## Seed
Create a Prisma seed script that inserts the first MARKETING_MANAGER account with a known email and password so I can log in and create the rest of the team.

## Suggested Build Order
1. Project scaffold, Tailwind, brand colors, layout and sidebar.
2. Prisma schema, migrations, seed the first admin.
3. Auth.js login and role based route protection.
4. User management (marketing manager).
5. Monthly direction (create and read).
6. Content piece CRUD plus assignment.
7. Creator task view and link submission.
8. Review flow (approve or reject with comment and ReviewLog).
9. Calendar view with status colors.
10. Reports and analytics.
