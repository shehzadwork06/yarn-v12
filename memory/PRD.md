# Purchase Return Feature - PRD

## Original Problem Statement
Implement purchase return functionality where:
1. Remove the purchase record and add it to the purchase return record when making a purchase return
2. Remove the returned quantity from purchase (support partial returns)
3. Mark purchase lot record as "RETURNED" status instead of deleting

## User Requirements
- **Partial Returns**: Support returning only some items from a purchase (reduce quantity from purchase)
- **Full Returns**: When all items are fully returned, delete the purchase record
- **Lot Status**: Mark lots as "RETURNED" instead of deleting them

## Architecture
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React
- **Database**: SQLite with separate tables for yarn_ and chem_ prefixed entities

## Core Requirements (Static)
1. Purchase return creates a return record with items
2. Partial return reduces purchase item quantities
3. Full return deletes purchase, marks lots as RETURNED
4. Purchase returns are preserved even after purchase deletion
5. Supplier ledger is updated on returns

## What's Been Implemented
- [2026-04-05] Added 'RETURNED' status to yarn_lots and chem_lots CHECK constraints
- [2026-04-05] Modified `processPurchaseReturn()` helper to handle partial/full returns
- [2026-04-05] Updated POST /api/purchase-returns endpoint for new logic
- [2026-04-05] Updated PUT /api/purchase-returns/:id endpoint for edit support
- [2026-04-05] Added database migration for RETURNED status

## Files Modified
- `/app/backend/config/database.js` - Added RETURNED status to lots tables
- `/app/backend/routes/purchaseReturns.js` - Rewritten return logic

## Testing Status
- Backend: 100% (28/28 tests passed)
- All purchase return scenarios validated

## Backlog / Future Enhancements
- P1: Add return reason dropdown with predefined options
- P2: Add return approval workflow
- P2: Generate purchase return PDF/invoice
- P3: Dashboard widget for return statistics
