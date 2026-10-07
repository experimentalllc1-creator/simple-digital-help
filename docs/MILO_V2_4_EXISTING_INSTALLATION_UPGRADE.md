# Milo v2.4: existing installation upgrade procedure

Status: repository preparation only. No live installation has been inspected or changed.

This procedure is separate from new installation. Execute only after explicit authorization for the live installation. Do not upload the new-installation file and ask to install Milo again.

## Record and protect the current installation

Record the spreadsheet ID/URL, Prospects and Needs Attention tab IDs, headers, formulas, formatting, validation, row count, and all existing cell values. Record the scheduled task ID, instructions, recurrence, timezone, enabled state, next run, activation date, and original service end date. Verify the actual assignment; do not infer it from repository defaults.

Save a recovery export of the spreadsheet and a snapshot of the task's original instructions and settings. Keep the same live spreadsheet as the operating workspace. Record customer-owned G:J values separately for exact comparison.

## Quiet migration window

Choose an interval between runs and confirm no discovery run is active. If necessary, temporarily pause the same task without changing its recurrence or expiry. Preserve its prior enabled state. Do not create or delete a task.

## Header-only spreadsheet change

If A:G exactly match Date Added, Business Name, City, Region, Customer Type, Website, Contacted? and H:J contain no conflicting content, add only Email, Phone, Notes to H1:J1. If the grid has fewer than ten columns, extend it only at the right edge. Do not move cells or rewrite existing rows. If all ten headers already match, make no schema change.

If headers differ, required tabs are missing, or H:J contain existing content that would be overwritten, stop and prepare a specific preservation plan. Never delete, rename, replace, reorder, or clear tabs, columns, or data. Never backfill Contacted? = No into existing rows.

## Update the existing task in place

Use the supported task edit operation on the recorded task ID to update only its discovery instructions. Preserve spreadsheet/tab IDs, assignment, recurrence, timezone, enabled state, activation date, and original service end date. Do not restart or extend the 52-week term.

Apply v2.4 ownership instructions: A:F are Milo-managed; G is initialized to No only when a new prospect is created and is customer-owned thereafter; H:J are entirely customer-owned and Milo never populates, clears, overwrites, or otherwise modifies their data cells, formulas, formatting, or validation. New prospect payloads target only A:G. Existing prospect G:J are preserved exactly. If a write result is uncertain, read back before retrying.

Updating the conversation alone is insufficient unless the recurring task demonstrably uses those updated instructions. If the platform cannot edit the task instructions while preserving its identity and schedule, stop. Do not substitute a replacement task.

## Verify before resuming

Compare every existing cell against the snapshot, including Contacted? values, customer contact details, notes, formulas, and validation. Verify unchanged spreadsheet/tab IDs, task ID, recurrence, timezone, activation date, and expiration. Restore the original enabled state only after these checks pass.

Observe the next scheduled run, or use a supported run-now operation on the same task that does not change recurrence. Confirm new rows contain A:F prospect data, G = No at creation, and untouched H:J. Confirm all existing rows are unchanged. Do not correct a subsequent customer change to a new row's Contacted? value.

## Recovery

If instruction verification fails, restore the previous instructions on the same task. If data preservation fails, stop further writes and investigate the exact differences. Keep any added customer columns and subsequent customer content intact. Do not blindly restore the full sheet, which could erase newer customer edits. Resolve only confirmed unintended changes using the recovery snapshot and customer review.

Record the upgrade outcome and evidence. This procedure does not authorize a purchase, email, deployment, or live task change by itself.
