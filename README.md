# Buyer Lead Intake App

A Next.js application for managing buyer leads, built to fulfil## Authentication & Ownership

**Multi-User Demo System:**
- Demo users: `admin/password123`, `sales1/sales123`, `sales2/sales456`, `manager/manager123`
- Each user can only edit/delete leads they created (ownership enforcement)

**Admin Privileges:**
- The `admin` user has special privileges and can edit/delete ALL leads regardless of ownership
- Admin status is indicated in the UI with an "ADMIN" badge
- Non-admin users are restricted to their own records only

**Ownership Enforcement:**
- Checked at the server action level before any update/delete operations
- `canEditRecord()` function handles both ownership and admin privilege logice requirements of the internship task.  
The app includes features for CRUD operations, advanced search and filtering, CSV import/export, and change history tracking.

---

## Live Demo & Credentials

* **Live App**: [https://buyer-lead-app.vercel.app](https://buyer-lead-app.vercel.app)  
* **Username**: `demo`  
* **Password**: `password`  

---

## Tech Stack

* **Framework**: Next.js 15 (App Router)  
* **Language**: TypeScript  
* **Database**: PostgreSQL with Prisma ORM  
* **Validation**: Zod for type-safe, schema-based validation (client and server).  
* **Authentication**: Simple JWT-based sessions with httpOnly cookies.  
* **Styling**: Custom CSS using CSS variables.  
* **Testing**: Jest & React Testing Library.  

---

## Getting Started

### Prerequisites
* Node.js v18+  
* A running PostgreSQL instance  

---

### 1. Setup Environment

Clone the repository and create a `.env` file in the root directory with the following variables:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# A secret key for signing JWTs
# Generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key"

# The base URL of your application
NEXTAUTH_URL="http://localhost:3000"
2. Install Dependencies & Set Up Database
bash
Copy code
# Install packages
npm install

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate deploy
3. Run the Application
bash
Copy code
npm run dev
The application will be available at http://localhost:3000.

Features Implemented
Full CRUD Functionality
Create, read, update, and manage buyer leads.

Advanced Filtering & Search
Server-side filtering by city, propertyType, status, and timeline.

Debounced search (300ms) for fullName, phone, and email.

All search and filter states are synced with the URL for easy sharing and bookmarking.

Server-Side Pagination
Leads table is paginated server-side, loading 10 items per page.

CSV Import/Export
Export: Download the currently filtered list of leads as a CSV file.

Import: Upload a CSV file (up to 200 rows) to bulk-create leads.

Each row is validated, and a summary of successful imports and errors is provided.

Authentication & Ownership
Simple demo login system.

Any logged-in user can view all leads, but they can only edit leads they created (ownerId match).

Audit History
All changes tracked in a separate buyer_history table, including a JSON diff.

Last 5 changes are visible on the lead’s edit page.

Concurrency Control
Simple optimistic concurrency check.

If a user tries to save a record that has been modified since it was loaded, they are prompted to refresh.

Quality & Polish
Unit Testing: Validation logic (buyerSchema) tested with Jest.

Rate Limiting: In-memory rate limiter on create/update to prevent abuse.

UI Polish: Custom error boundaries, user-friendly empty states, and basic accessibility features.

Design & Architecture Notes
Validation:
A single Zod schema (buyerSchema) is used as the source of truth on both client and server.
A separate schema (csvImportSchema) is used for CSV imports to allow optional fields.

Server vs. Client:
Server Components and Server Actions handle most logic and fetching.
Client Components (like SearchFilters) are used only where interactivity is required.

State Management:
The URL is treated as the primary state manager for filters and pagination.
This makes the app more robust, shareable, and user-friendly.

Ownership:
Enforced at the action level on the server. Before updates, the ownerId is checked against the current user.

What's Done vs. Skipped
Completed:

All must-have and quality bar requirements.

Implemented 3 “nice-to-have” features: Debounced Search, URL State Management, and Responsive Design.

Skipped:

“Tag typeahead” and “Optimistic edit” to focus on core requirements.

Instead, tags are implemented as a simple comma-separated text input, which still supports filtering effectively.

pgsql
Copy code
