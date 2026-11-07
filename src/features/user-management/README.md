# User Management

## Overview

`user-management` owns manager-facing management of:

- Agency accounts
- Shipper accounts
- Create / edit / delete user flows
- Kitchen/POS assignment for managed users
- Search, refresh, pagination and error states for managed user lists

Current routes:

```text
/manager-agency
/manager-shipper
```

The feature follows the project architecture:

```text
Page
  ↓
Hooks
  ↓
Feature API / Shared API
  ↓
Backend

Components
  ↑
Presentation only
```

The goal is to keep orchestration in pages, business/data state in hooks, backend contracts in API modules, and rendering in components.

---

## Structure

```text
src/features/user-management/
├── api/
│   ├── agencies.api.js
│   ├── assignments.api.js
│   ├── index.js
│   ├── managedUsers.api.js
│   └── shippers.api.js
│
├── components/
│   ├── ManagedUserFormModal/
│   ├── ManagedUsersTable/
│   ├── UserKitchenAssignmentModal/
│   └── index.js
│
├── constants/
│   ├── index.js
│   └── userTypes.js
│
├── hooks/
│   ├── index.js
│   ├── useManagedUserActions.js
│   ├── useManagedUserEditor.js
│   ├── useManagedUsers.js
│   └── useUserKitchenAssignments.js
│
├── pages/
│   ├── AgencyManagementPage/
│   ├── ShipperManagementPage/
│   ├── UserManagementPage/
│   └── index.js
│
├── README.md
└── index.js
```

Shared APIs used by this feature:

```text
src/shared/api/account.api.js
src/shared/api/manager.api.js
```

---

## Feature Boundary

### Owned by `user-management`

The feature owns:

```text
manager/shippers-by-phone

agency/delete-agency
shipper/delete-shipper

pos-agency/assign
pos-agency/remove

pos-shipper/assign
pos-shipper/remove
```

It also owns feature-level wrappers for account create/update:

```text
createManagedUser
updateManagedUser
```

### Shared contracts

These contracts are not exclusive to User Management and therefore live in `shared/api`.

```text
manager/agencies-by-phone
manager/pos-info

auth/register
user/update
```

They are also needed outside this feature, so they must not be moved into `user-management` merely for locality.

---

## User Types

Supported types are defined in:

```text
constants/userTypes.js
```

```text
agency  → ROLE_AGENCY
shipper → ROLE_SHIPPER
```

Each type config contains its UI copy and success/error messages.

Pages should consume this config instead of scattering checks such as:

```text
if type === agency
if type === shipper
```

throughout the UI.

---

## Pages

### AgencyManagementPage

Thin entry page:

```text
AgencyManagementPage
  ↓
UserManagementPage(type=agency)
```

Agency management supports kitchen assignment.

### ShipperManagementPage

Thin entry page:

```text
ShipperManagementPage
  ↓
UserManagementPage(type=shipper)
```

Shipper management also supports kitchen assignment.

### UserManagementPage

This is the orchestration layer.

It coordinates:

- Current manager identity
- List/search/refresh hooks
- Create/edit modal state
- Delete confirmation state
- Kitchen assignment modal state
- Toast feedback
- Refetch after mutations

Business rules should not be moved back into `ManagedUsersTable`.

---

## Hooks

### `useManagedUsers`

Owns:

- Fetching managed users
- Loading/error state
- Search value
- Search filtering
- Refresh
- Local list helpers after mutation
- Stale-request protection

Search currently matches:

```text
full name
raw phone number
formatted phone number
```

Search input is intentionally not sanitized.

### `useManagedUserActions`

Owns destructive user mutations.

Currently:

```text
delete agency
delete shipper
```

It does not own confirm modals or toast UI.

### `useManagedUserEditor`

Owns create/edit business calls.

Create payload includes:

```text
firstName
lastName
phoneNumber
password
role
managerPhone
```

Edit uses the original `phoneNumber` as the identifier and updates profile fields.

Phone number is not editable in edit mode.

### `useUserKitchenAssignments`

Owns:

- Loading manager kitchens
- Assigning kitchens
- Removing kitchen assignments
- Assignment mutation state
- Batch assignment results

Batch mutation uses:

```text
Promise.allSettled
```

rather than `Promise.all`.

This is intentional because each POS assignment is a separate backend request and the batch is not transactional.

Possible results:

```text
all success
partial success
all failed
```

On partial success the page refetches the user list so the UI reflects the real backend state.

---

## Components

### `ManagedUsersTable`

Presentation responsibilities:

- Name
- Phone
- Assigned kitchens
- Edit
- Delete
- Kitchen management action
- Pagination
- Empty/error states

Pagination is fixed to 10 rows and does not expose a page-size selector.

Search changes reset pagination to page 1.

Deleting the last record on the final page clamps pagination to the nearest valid page instead of forcing page 1.

### `ManagedUserFormModal`

Supports:

```text
create
edit
```

Create fields include:

- Phone
- First name
- Last name
- Password
- Password confirmation

Edit keeps phone read-only and exposes profile fields supported by the existing update contract.

### `UserKitchenAssignmentModal`

Shows:

- Currently assigned kitchens
- Available kitchens
- Add assignment action
- Remove assignment action
- Retry state
- Loading/error/empty states

If a user contains an assigned kitchen name that cannot be resolved to a current POS ID, the UI displays it but does not pretend it can safely remove the assignment.

---

## Kitchen Assignment Contract

Agency:

```text
pos-agency/assign
pos-agency/remove
```

Shipper:

```text
pos-shipper/assign
pos-shipper/remove
```

Important backend compatibility rule:

The shipper endpoints currently use the query parameter:

```text
agencyPhone=<shipper phone>
```

Do not rename this to `shipperPhone` unless the backend contract is explicitly changed.

The parameter name looks inconsistent, but it is part of the current backend contract.

---

## Account APIs

Shared account API:

```text
src/shared/api/account.api.js
```

Current contracts:

```text
POST auth/register
PUT  user/update
```

Legacy service modules may keep compatibility exports while other modules still depend on them.

Do not duplicate these backend calls inside feature API files.

---

## Shared Manager APIs

Shared manager API:

```text
src/shared/api/manager.api.js
```

Current shared contracts:

```text
manager/agencies-by-phone
manager/pos-info
```

They remain shared because other modules such as address/POS flows also consume them.

---

## UI Rules

User Management uses project shared UI:

```text
ManagementPageHeader
ManagementTable
ManagementFormModal
PrimaryActionButton
ConfirmModal
AppToast
```

Do not use direct Ant Design notification/message calls in this feature.

Brand direction:

```text
brown / gold / cream
neutral surfaces
semantic red only for destructive actions
```

Avoid reintroducing default Ant Design blue as the primary visual language.

---

## Error Handling

API modules throw errors.

Hooks do not convert failed requests into fake success values.

Pages decide how to communicate errors through `AppToast`.

Examples:

```text
fetch error
→ table error state + retry

create/edit/delete error
→ toast error

kitchen list error
→ modal error state + retry

partial kitchen assignment
→ refetch + warning toast
```

---

## Legacy Cleanup

The following legacy User Management implementation was removed after route migration:

```text
src/pages/AgencyManage
src/pages/ManageShipper

src/components/AgencyList
src/components/ShipperList
src/components/ManagePosModal

src/components/Auth/AgencyForm.js
src/components/Auth/ShipperForm.js

src/services/agency.js
src/services/shipper.js
src/services/posForAgency.js
src/services/posForShipper.js
```

The following should no longer be part of the runtime User Management flow:

```text
openFormAgency
setOpenFormAgency
openFormShipper
setOpenFormShipper

AgencyForm
ShipperForm
ManagePosModal
EditAgencyModal
EditShipperModal
```

Do not remove unrelated shared/legacy services simply because their names mention Agency or POS. Always verify consumers first.

---

## Routes

Current route mapping:

```text
/manager-agency
→ AgencyManagementPage

/manager-shipper
→ ShipperManagementPage
```

The routes should no longer point to:

```text
pages/AgencyManage
pages/ManageShipper
```

---

## Manual QA

Test both routes:

```text
/manager-agency
/manager-shipper
```

Verify:

```text
load users
search by name
search by raw phone
search by formatted phone
clear search
refresh
create
edit
delete confirmation
delete success/error
open kitchen management
assign one kitchen
assign multiple kitchens
remove one kitchen
remove multiple kitchens
retry kitchen load
empty list
empty search result
pagination
```

For create, confirm roles:

```text
Agency  → ROLE_AGENCY
Shipper → ROLE_SHIPPER
```

For edit, confirm phone remains read-only.

---

## Final Repository Checks

### No User Registration dependency

`user-management` and `user-registration` are separate features and must not import each other.

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  'user-registration' \
  src/features/user-management
```

Expected:

```text
no output
```

### No direct Ant Design toast

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'notification\.(success|error|warning|info)|message\.(success|error|warning|info)' \
  src/features/user-management
```

Expected:

```text
no output
```

### No removed Agency/Shipper modal flow

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'openFormAgency|setOpenFormAgency|openFormShipper|setOpenFormShipper|AgencyForm|ShipperForm' \
  src
```

Expected:

```text
no runtime output
```

Comments in unrelated obsolete files should be cleaned separately rather than treated as active consumers.

### No removed service imports

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E "services/(agency|shipper|posForAgency|posForShipper)|from ['\"]\./(agency|shipper|posForAgency|posForShipper)['\"]" \
  src
```

Expected:

```text
no output
```

### Route ownership

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'AgencyManagementPage|ShipperManagementPage|pages/AgencyManage|pages/ManageShipper' \
  src/routes src/features/user-management
```

Expected:

- New feature pages are present.
- Legacy page imports are absent.

### Shipper backend compatibility

```bash
grep -RIn \
  --include='*.js' \
  'pos-shipper/' \
  src/features/user-management
```

Verify the backend query still uses:

```text
agencyPhone=
```

until backend documentation says otherwise.

### Batch assignment

```bash
grep -RIn \
  --include='*.js' \
  -E 'Promise\.all\(|Promise\.allSettled' \
  src/features/user-management
```

Kitchen assignment should use:

```text
Promise.allSettled
```

---

## Build

Run:

```bash
npm run build
```

Do not consider the milestone complete until the actual repository build succeeds.

Also manually test both manager routes after a successful build.

---

## Definition of Done

M9 is complete when:

- Both manager routes use the new feature
- Agency and shipper lists load correctly
- Search behavior is consistent
- Create/edit/delete work
- Kitchen assignment works for both user types
- Partial assignment failures do not leave stale UI
- Feature does not depend on `user-registration`
- Removed legacy components/services have no runtime consumers
- No direct Ant Design toast remains inside the feature
- Pagination has no page-size selector
- Build succeeds
- Manual route QA succeeds

---

## Future Work

Do not put unrelated customer management into this feature automatically.

`/manager-customer` is a separate domain and should be migrated independently unless a later audit proves the business rules and backend contracts are genuinely shared.

Also avoid promoting additional code into `shared` until a second real consumer exists.

Shared is earned.
