# IMPACT Nexus

Build a complete production-ready web platform for IMPACT Group of Companies with a professional corporate design, modern UI/UX, mobile responsiveness, role-based authentication, Supabase backend integration, and scalable database architecture.

==================================================

ORGANIZATION OVERVIEW

==================================================

The platform represents:

1. IMPACT Capacity Development Agency (ICDA)

2. IMPACT Designers Warehouse (IDW)

3. INQABA Adopt A Child Programme

The mission is to empower youth, women, rural communities, entrepreneurs, learners, donors, and vulnerable groups through skills development, education, economic empowerment, community development, and social impact initiatives.

==================================================

DESIGN REQUIREMENTS

==================================================

Create a modern, clean, professional design.

Color palette:

- Navy Blue

- White

- Gold accents

Requirements:

- Mobile responsive

- Professional corporate appearance

- Modern UI/UX

- Accessibility compliant

- Fast loading

- User friendly

- Sticky navigation bar

- Movable navigation bar

- Dashboard layouts

- Professional cards

- Professional forms

- Data tables

- Analytics dashboards

==================================================

PUBLIC WEBSITE

==================================================

Home Page

Include:

- Hero section

- Mission and Vision

- About IMPACT Group

- Community impact statistics

- Testimonials

- Success stories

- Call-to-action sections

- Partner organizations

- Upcoming events

- Featured courses

- Featured products

- Donation opportunities

About Us

Include:

- Company overview

- Organizational structure

- Leadership team

- Mission

- Vision

- Values

- Quality policy

ICDA Academy

Include:

- Course catalogue

- Course categories

- Course details

- Enrollment process

- Course schedules

- Course capacity

- Start dates

- End dates

- Enrollment deadlines

IMPACT Designers Warehouse

Include:

- Marketplace

- Product catalogue

- Designer showcase

- Product categories

- Shopping functionality

INQABA Adopt A Child

Include:

- Programme overview

- Beneficiary stories

- Donation opportunities

- Sponsorship options

- Community initiatives

Contact Page

Include:

- Contact form

- Phone numbers

- Email

- Office address

- Social media links

==================================================

USER ROLES

==================================================

Create four user roles:

1. Administrator

2. Student / Learner

3. Donor

4. Public Visitor

Implement complete Role-Based Access Control (RBAC).

==================================================

AUTHENTICATION SYSTEM

==================================================

Use Supabase Authentication.

Features:

- Registration

- Login

- Logout

- Password reset

- Email verification

- Session management

- Remember me

If a user is already logged in:

DO NOT ask the user to sign in again when enrolling for a course, making a donation, or purchasing products.

The system must automatically use the existing authenticated session.

==================================================

STUDENT DASHBOARD

==================================================

Create a Student Dashboard.

Profile Features:

- Profile picture

- Full name

- Contact details

- Address

- Enrollment history

- Certificates

- Course progress

- Notifications

Enrollment Features:

- Enroll in courses

- Track enrollment status

- View course schedules

- Download certificates

- View completed courses

Shopping Cart Features:

The cart must appear for:

- Students

- Donors

The cart must NOT appear for:

- Administrators

Cart Features:

- Add products

- Add courses

- Remove items

- Update quantities

- Checkout

==================================================

DONOR DASHBOARD

==================================================

Create a Donor Dashboard.

Features:

- Profile management

- Donation history

- Active sponsorships

- Donation receipts

- Event participation history

Shopping Cart:

Donors must have access to the shopping cart.

==================================================

ADMIN DASHBOARD

==================================================

Create a comprehensive Admin Dashboard.

Features:

- User management

- Course management

- Product management

- Event management

- Enrollment management

- Reports and analytics

- Archive management

- Notifications

==================================================

COURSE MANAGEMENT

==================================================

Administrators can:

- Create courses

- Edit courses

- Archive courses

- Restore archived courses

- Delete courses

Course Fields:

- Course title

- Description

- Category

- Instructor

- Start date

- End date

- Registration deadline

- Maximum enrollment capacity

- Available seats

- Status

==================================================

COURSE CAPACITY CONTROL

==================================================

Administrators must be able to set:

- Maximum enrollments per course

The system must automatically:

- Track enrollments

- Count available seats

- Display remaining seats

When capacity is reached:

- Mark course as FULL

- Prevent new enrollments

- Display "Course Full"

Optionally allow:

- Waitlist enrollment

==================================================

ENROLLMENTS

==================================================

Administrators can:

- Approve enrollments

- Reject enrollments

- Search enrollments

- Filter enrollments

Enrollment filtering:

- By year

- By course

- By student

Enrollments must be organized by:

- 2025

- 2026

- 2027

- Future years

==================================================

ARCHIVE SYSTEM

==================================================

Administrators can archive and restore:

- Courses

- Products

- Events

- Enrollments

- Feedback

Archived items must not appear publicly.

==================================================

EVENT HISTORY MANAGEMENT SYSTEM

==================================================

Create a complete Event History Module.

The system shall allow users to view details of previous events.

Events include:

- Workshops

- Training sessions

- Graduation ceremonies

- Community outreach programs

- Donation drives

- Awareness campaigns

- Social impact initiatives

==================================================

EVENT RECORD FIELDS

==================================================

Each event must include:

- Event title

- Event category

- Event description

- Event objectives

- Event location

- Event date

- Start time

- End time

- Number of attendees

- Event outcomes

- Event organizer

- Event status

- Supporting documents

==================================================

EVENT GALLERY

==================================================

Each event must support:

- Multiple image uploads

- Featured image

- Photo gallery

- Image captions

Store images using Supabase Storage.

==================================================

EVENT FEEDBACK

==================================================

Each event must support:

- Participant feedback

- Donor feedback

- Community feedback

- Ratings

- Testimonials

- Recommendations

Display feedback publicly.

==================================================

EVENT ACCESS CONTROL

==================================================

Only Administrators can:

- Create events

- Edit events

- Delete events

- Archive events

- Restore events

- Upload images

- Manage galleries

- Create feedback

- Edit feedback

- Delete feedback

Students can:

- View events

- View images

- View outcomes

- View feedback

Donors can:

- View events

- View images

- View outcomes

- View feedback

Public visitors can:

- View published events

- View approved feedback

==================================================

ROLE-BASED API PERMISSIONS

==================================================

Implement API authorization rules.

Administrator:

- CREATE

- READ

- UPDATE

- DELETE

for:

- Events

- Feedback

- Images

- Reports

- Courses

- Products

Students:

- READ ONLY

for:

- Events

- Feedback

- Courses

- Products

Donors:

- READ ONLY

for:

- Events

- Feedback

- Courses

- Products

Public Visitors:

- READ ONLY

for public content.

==================================================

REPORTING

==================================================

Create reports for:

- Students

- Enrollments

- Donations

- Courses

- Events

Allow:

- PDF export

- Excel export

==================================================

NOTIFICATIONS

==================================================

Create notification system for:

- New enrollments

- Enrollment approvals

- Course full alerts

- Upcoming events

- Donation confirmations

==================================================

SECURITY

==================================================

Use Supabase Row Level Security.

Implement:

- Secure authentication

- Role-based authorization

- Audit logs

- Session tracking

==================================================

DEVICE LOGIN RESTRICTION

==================================================

Allow only one active session per account.

If a user signs in from another device:

Option 1:

- Automatically sign out the previous device

OR

Option 2:

- Block the new login and show a warning

This behavior must be configurable by administrators.

==================================================

DATABASE

==================================================

Create Supabase database tables for:

- Users

- Profiles

- Roles

- Courses

- Course Categories

- Enrollments

- Enrollment Years

- Products

- Product Categories

- Shopping Cart

- Orders

- Donations

- Notifications

- Events

- Event Images

- Event Feedback

- Archived Records

- Audit Logs

Create all relationships, indexes, triggers, API endpoints, and Row Level Security policies.

==================================================

FINAL REQUIREMENT

==================================================

Generate the complete application including:

- Public website

- Student dashboard

- Donor dashboard

- Admin dashboard

- Supabase backend

- Database schema

- Authentication

- API permissions

- Event management

- Enrollment management

- Marketplace

- Shopping cart

- Reporting

- Notifications

- Archive system

- Mobile responsiveness

- Production-ready architecture

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a6c499b-49ac-4876-bf63-748a9fc00b64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
