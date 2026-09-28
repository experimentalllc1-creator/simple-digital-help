# Find New Customers — V2

Route: `/categories/sales/find-new-customers`

Title: Find New Customers
Opening: Find businesses that could become your customers.

## Shared introduction

One introduction serves all present and future Milo industry/region variations.
The local, silent, approximately 20-second temporary MP4 uses three text slides and manual playback
with native controls, inline playback and a responsive 16:9 player. No autoplay or
looping. A poster, English captions and expandable text transcript are included.
The final slide and transcript use the approved closing exactly:

“If this sounds like something you need, click below. Let's find the right version for your business.”

Replace `public/videos/find-new-customers-intro.mp4` with the final video, and update
the poster, captions and transcript together. Video paths and the completion key are
centralized in `src/lib/sales-catalog.ts`. Update the source MIME type if changing format.
Do not create separate explainer videos for each product variation.

## Completion and selection

“I Want to Know More” sits directly below the player, initially disabled and gray.
The native `ended` event enables it and stores `true` in localStorage under
`sdh:find-new-customers:video-complete:v1`. Returning visitors can immediately click
the button; the selector appears only after that click. The selector heading receives
focus for keyboard/screen-reader navigation. No anti-skipping logic is used.

If localStorage is blocked, completion still unlocks the current visit without error;
completion cannot persist across reloads in that case. A video-load failure shows a
retry message. Direct product-page visits are never gated. Completion is shared across
variations on the same browser origin. Bump the key only if a new introduction must
be watched again.

The revealed heading is “Select your industry and region of interest.”
Industry options: Roofing Contractors, HVAC Contractors, Landscaping Contractors,
Plumbing Contractors. Region options: Florida, Texas, California, Georgia, New York.
Initial selection: Roofing Contractors + Florida.

Match published entries in the reusable sales catalog. Roofing Contractors + Florida
shows “Milo | Automated Prospect Discovery - Florida Roofing Contractors” and View
Product. All other combinations show “No product available for this selection yet.”
Unpublished products never appear. This is a browse-only flow, not a purchase promise.

This document supersedes any earlier guidance to place this video on Milo's page.
