# Step 01 — Architecture Skeleton

## Purpose

Tạo điểm đến cho incremental migration mà không làm thay đổi code đang chạy.

## Changes

Added:

- `src/app/`
- `src/features/orders/`
- `src/shared/`
- root `README.md`
- architecture documentation
- Order migration documentation

## Runtime impact

**None intended.**

Không import mới, không route mới, không move implementation, không thay API call, không thay UI.

## Verification

Vì archive source được cung cấp không có `package.json`/lockfile nên Step 1 không thể chạy build/test dependency-aware từ archive này. Verification ở bước này là structural: không có file runtime hiện tại bị chỉnh sửa hoặc xóa.

Khi áp dụng vào repository đầy đủ, chạy build/test hiện có trước khi merge.

## Next

Step 02 — migrate Order constants/status metadata.
