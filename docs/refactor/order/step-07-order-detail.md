# Step 07 — Order Detail

## What changed

The legacy OrderDetailModal was migrated into
the Orders feature.

The detail component was decomposed into:

- OrderDetail
- OrderInfo
- OrderSummary
- OrderEditModal

## Business rules

Order editing permission is centralized through
`canEditOrder`.

Currently only CHECKING orders can be edited.

## Data logic

Order update payload building and request item
counting were moved into order utilities.

## API boundary

Order update and request cancellation now go
through the Orders API layer instead of importing
the legacy service directly.

## Compatibility

The old OrderDetailModal path remains as a
temporary compatibility bridge.

Legacy paths should be removed during Step 10.

## Result

OrderDetail is now primarily an orchestration
component instead of a large mixed-responsibility
modal.