# Anchored Project Summary

## Objective
- Make Wishlist + Cart fully functional site-wide, fix related UX bugs (hydration, icon placement, badges), route International/Domestic/Spiritual tour packages into Wishlist Destinations sub-tab, show user/admin panel notifications on the main website navbar (incl. mobile top bar), fix the duplicate 3-line hamburger menu on mobile, add a desktop/tablet user-profile dropdown (avatar) that contains Dashboard / Admin Panel (admin only) / Logout, and redesign the user dashboard cart panel with image-card layout (image overlay with name/category/duration, description, rating, price, Book button).

## Important Details
- Project root: `C:\Users\MSI 1\Desktop\Divine travels1\Divine travels\Divine-Travels` (Next.js 16.2.6, React 19, TS, Tailwind v4, shadcn/ui, Prisma+libSQL Turso, Zustand).
- Dev server: **http://localhost:3002** (`npx next dev -p 3002 --webpack`); running with latest code.
- Test user: `customer@test.com` / `test1234` (id `cmsvk5gy900007ky4p1sze7ui`).
- API `x-user-id` header auth; store persisted to localStorage key `divine-travel-store` (`user`, `isAuthenticated`, `isAdmin` only; `skipHydration: true`).
- Hydration root cause (FIXED): store initial `currentView: 'landing'` + `page.tsx` view wrapper `initial={false}` (Navbar `motion.header` mismatch resolved).
- `tourPkgWishlist` filter: categories `['international-tours','domestic-tours','spiritual-tours']` (see `UserWishlist.tsx`).
- Notifications: `/api/notifications` GET (`x-user-id`, `?unread=true`) + POST; same data feeds panel bells and new navbar bell.
- `src/components/landing/TealNavBar.tsx` has its own hamburger + mobile menu but is **UNUSED** (not imported) — not the duplicate source.
- Notifications "Clear all": added `DELETE /api/notifications` (auth via `x-user-id`, `db.notification.deleteMany({ where: { userId } })`). Added a **Clear all** button (Trash2 icon, red) to all 3 notification surfaces — `NavbarNotifications.tsx`, `UserNotifications.tsx`, `AdminNotificationBell.tsx` — shown only when `notifications.length > 0`, with a `window.confirm` guard. Already-existing **Mark all read** (CheckCheck) remains. Verified headless: Clear all empties the list → "No notifications yet" and hides the button.
- Profile dropdown (`NavbarUserMenu.tsx`): originally attempted with shadcn/Radix `DropdownMenu`, but Radix dropdown did not open under headless interaction and is otherwise unused in the app; reimplemented with the **same custom-dropdown pattern as `NavbarNotifications`** (`open` state + `ref` + document `mousedown` outside-click handler + absolute popup). Avatar shows `user.avatar` image if present else initials (`getInitials`); dropdown header shows `name`+`email`; items: `Dashboard` (`setDashboardTab('overview')`+`user-dashboard`), `Admin Panel` (only if `isAdmin`→`admin-dashboard`), `Logout` (red). Hidden on mobile (`hidden sm:flex`); mobile still uses hamburger menu's Dashboard/Logout links.
- Duplicate-hamburger root cause (FIXED): `Navbar.tsx` had a stray `sm:hidden` Menu/X hamburger button rendered ALWAYS (outside the `isAuthenticated` ternary) at the old top-bar position, in addition to the correct authenticated-branch hamburger. That stray button had also replaced the original `md:hidden` mobile Search icon. Fixed by replacing the stray hamburger with a restored `md:hidden` Search icon button. Mobile top bar is now `[bell] [search] [hamburger]` with exactly one 3-line menu. Headless verification: `hamburgerCount=1`, `bellPresent=true`.
- `examples/websocket/` has pre-existing tsc errors (missing `socket.io` deps) — unrelated.
- Pre-existing unrelated warning: `UserDashboard.tsx` Overview "Recent Bookings" merges 4 booking arrays with `key={booking.id}` → duplicate key (seen for test user id `cmsvtru2b000d7k6898srpbok`). NOT from wishlist code.
- Headless Chrome (puppeteer-core at `C:\Program Files\Google\Chrome\Application\chrome.exe`) used for verification; test scripts may still exist (`inspect_*.mjs`, `ss_mobile.mjs`, `mobile_topbar.png`, `mobile_menu_open.png`, `check_ham.mjs`).
- Camping (`stay-camping`) tiered group-size pricing: `RoomTypeInput.pricingTiers: PricingTier[]` = `{minPax, maxPax, pricePerPerson}` (per person per night). Per-person rate is resolved from the **actual headcount** via `resolveCampingTier(roomType, headcountPerCamp)` (falls back to nearest tier bound when outside all ranges), NOT from a flat price. `computeCampingBreakdown` builds `CampingBookingBreakdown` (`isCamping:true`, fields: campTypeName, tierPerCamp, pricePerPerson, roomCost, mealPlanName/Price, mealCost, discount, total, adults, children) and is stored in `PackageBooking.additionalNotes`. API `POST /api/package-bookings` detects `isCamping` and **server-side re-derives the total from the package's tier table + headcount** — the client-sent `pricePerPerson` is ignored, so a 2-person booking can NEVER be charged the 4-person rate (and vice-versa). `unitPrice`/`totalPrice` = re-derived total; `originalPrice`/`basePrice` from package. Admin `AdminPackages.tsx` has a per-room-type **Pricing Tiers editor** (shown only when `form.category==='stay-camping'`); `RoomType` interface gains `pricingTiers?`. Verified end-to-end: 2-pax tamper-claiming 4-pax rate → forced ₹1800 (₹3600); 4-pax → ₹1200 (₹4800); 3-pax → ₹1600 (₹4800). All PASS. `tsc` clean.

## Work State
### Completed
- Wishlist icon `PackageWishlistOverlay.tsx` → `absolute bottom-3 right-3`; `PackageWishlistButton.tsx` unsaved circle `bg-white` → `bg-white/80`; toast + invalidation.
- `<Toaster>` `top-right` → `bottom-right` in `layout.tsx`.
- `UserWishlist.tsx`: Destinations/Packages sub-tab count badges + auto-select; International/Domestic/Spiritual packages render under **Destinations** (verified: "Malaysia Tour" in Destinations, not Packages).
- `Navbar.tsx`: added wishlist count badge on Heart icon (dest+pkg `useQuery`); `NavbarNotifications` desktop (`hidden sm:block`) + mobile top bar (`sm:hidden` before hamburger); removed inline bell from hamburger menu; **fixed duplicate hamburger** by removing stray always-rendered hamburger and restoring the `md:hidden` Search icon; **replaced the 3 separate Admin/Dashboard/Logout buttons with `<NavbarUserMenu />`** in the authenticated branch (kept Wishlist, Cart, Notifications bell).
- `UserDashboard.tsx`: added wishlist count badge on sidebar Wishlist button (desktop + mobile).
- Created `NavbarNotifications.tsx`: bell + unread badge + dropdown using same `/api/notifications`; `inline` mode (mobile menu) + `onNavigate` callback; role-aware nav (admin→`admin-dashboard`, user→`user-dashboard` or `package-bookings` if `n.link==='dashboard'`); polls 30s.
- Created `NavbarUserMenu.tsx`: avatar + custom dropdown (Dashboard / Admin Panel [admin only] / Logout); replaced the 3 separate authenticated buttons.
- Added "Clear all" (delete) to all 3 notification UIs + `DELETE /api/notifications` endpoint.
- Created `/api/cart-items/route.ts` batch API: accepts `?packageIds=...&destinationIds=...`, returns enriched data (name, tagline, description, category, duration, rating, reviewCount, image, price) with computed avg rating from reviews.
- Redesigned `UserCartPanel.tsx` with image-card layout matching screenshot: full-width hero image with gradient overlay (package name, category icon+tag, duration icon+tag), delete icon top-right, description below, bottom row with star rating, price, "Book →" button. Grid layout (`grid-cols-1 md:grid-cols-2`). Fetches enriched data via batch API. Empty state preserved.
- Verified headless (1280px): cart renders 2 cards ("Turkey Tour" + "Malaysia Tour"), each with Book button and delete button. `tsc` clean.
- **Camping tiered group-size pricing implemented** (see Important Details). Added `pricingTiers`/`PricingTier` to `RoomTypeInput` + `resolveCampingTier` + `computeCampingBreakdown` + `parseCampingNotes` in `src/lib/hotelBooking.ts`. `PackageBookingForm.tsx` adds `isCamping` branch (computes `campingBreakdown`, shows "Camps"/"Camp Type" labels + live tier in summary). `package-bookings` API detects `isCamping` and server-re-derives total from tiers+headcount (tamper guard). `BookingVoucherModal.tsx` adds `isCamping`/`campingBreakdown` receipt branch. `UserPackageBookings.tsx` + `UserDashboard.tsx` pass camping data to the voucher. `AdminPackages.tsx` adds Pricing Tiers editor (camping-only) per room type. Verified end-to-end PASS; `tsc` clean.

### Active
- (none)

### Blocked
- (none)

## Next Move
1. Clean up leftover test scripts (`inspect_*.mjs`, `ss_mobile.mjs`, `mobile_*.png`, `check_ham.mjs`) and remove `puppeteer-core` dev dep if no further testing.
2. Optionally confirm with the user that the mobile top-bar layout (`[bell] [search] [hamburger]`) matches their expectation.

## Relevant Files
- `src/components/user/UserWishlist.tsx` — Destinations sub-tab = `destWishlist` + `tourPkgWishlist` (3 tour categories); Packages sub-tab = other categories; badges + auto-select; prefixed keys `dest-`/`pkg-`.
- `src/components/landing/Navbar.tsx` — wishlist badge on Heart; `NavbarNotifications` desktop (`hidden sm:block`) + mobile top bar (`sm:hidden`); restored `md:hidden` Search icon; single authenticated-branch hamburger.
- `src/components/landing/NavbarNotifications.tsx` — new bell component (inline mode, onNavigate, polls 30s, role-aware nav).
- `src/components/landing/NavbarUserMenu.tsx` — NEW: avatar (image or initials) + custom dropdown with Dashboard / Admin Panel (admin only) / Logout; hidden on mobile (`hidden sm:flex`).
- `src/components/user/UserCartPanel.tsx` — REDESIGNED: image-card grid layout with enriched data from batch API; hero image + overlay (name, category, duration) + delete + description + rating + price + Book button.
- `src/app/api/cart-items/route.ts` — NEW batch API: `GET ?packageIds=...&destinationIds=...` returns enriched package/destination data with computed avg rating from reviews.
- `src/app/layout.tsx` — `<Toaster richColors position="bottom-right" />`.
- `src/lib/store.ts` — `currentView: 'landing'`; `skipHydration: true`.
- `src/app/page.tsx` — `motion.div initial={false}`; `Navbar` rendered when `currentView !== 'landing'`.
- `src/components/user/UserDashboard.tsx` — Overview dup-key (pre-existing, unrelated); wishlist sidebar badge (desktop+mobile).
- `src/components/cart/PackageWishlistOverlay.tsx` / `PackageWishlistButton.tsx` — grid heart + toast.
- `src/app/api/notifications/route.ts` — GET/POST notifications (same data for navbar + panels).
- `src/app/api/package-wishlist/route.ts` — GET rows (`.id`=row id, `.package` nested); POST prevents dup via `userId_packageId`.
- `src/lib/hotelBooking.ts` — `RoomTypeInput.pricingTiers`, `PricingTier`, `resolveCampingTier`, `computeCampingBreakdown`, `parseCampingNotes`, `parseHotelNotes`, `computeHotelBreakdown`, `HotelBookingBreakdown`, `CampingBookingBreakdown`.
- `src/app/api/package-bookings/route.ts` — POST detects `isHotel`/`isCamping` from `additionalNotes`; server re-derives camping total from tiers + headcount (tamper guard).
- `src/components/package/PackageBookingForm.tsx` — `isCamping` branch: `campingBreakdown` computation, "Camps"/"Camp Type" labels, live tier in price summary.
- `src/components/booking/BookingVoucherModal.tsx` — `isCamping`/`campingBreakdown` receipt branch (camp + group-rate line + meal + discount).
- `src/components/user/UserPackageBookings.tsx` + `src/components/user/UserDashboard.tsx` — detect/pass `isCamping`/`campingBreakdown` to voucher.
- `src/components/admin/AdminPackages.tsx` — `RoomType` gains `pricingTiers?`; camping-only Pricing Tiers editor per room type.
- `src/components/landing/TealNavBar.tsx` — UNUSED, own hamburger (not the duplicate cause).
- Test artifacts (may still exist): `inspect_*.mjs`, `ss_mobile.mjs`, `mobile_topbar.png`, `mobile_menu_open.png`, `check_ham.mjs`.

## Recent Admin Booking Features (post-wishlist scope)
- Taxi negotiation: `POST /api/booking-flow/tour/[id]/accept-user-amount` (admin accepts user's proposed amount → sets negotiatedPrice/priceLocked, status=confirmed); "Accept ₹X" button in `AdminTaxiBookings.tsx`. Billing bug fixed in `payments/route.ts` (reads `payType`, not only `type`; advance=10%). 403-on-unowned fixed on detail/offers/payments GETs (allow `userId:null` for any authed user); payments claims booking to payer.
- "View all" (AdminOverview) → `all-bookings` tab. `AdminAllBookings.tsx` + `GET /api/admin/all-bookings` (merges destination/package/tour/taxi; bike/hotel/camping bookings live in `packageBooking` keyed by `Package.category` = `bike-rental`/`stay-hotel`/`stay-camping`). Server-side `search` (guest/email)/`type` (`destination`|`package`|`tour`|`taxi`|`bike-rental`|`stay-hotel`|`stay-camping`)/`status` filters + pagination. NOTE: `type=tour` matches Day Tour only (taxi is separate `type=taxi`) — earlier bug filtered Day Tour via displayType "Day Tour" vs value "tour".
- Upcoming Bookings box (AdminOverview `UpcomingBookingsBox`): filter chips 1 Week/15 Days/1 Month → `GET /api/admin/upcoming-bookings?range=week|15|30` (active statuses pending/confirmed/approved/completed, forward window; returns `data`+`counts` so chips match table).
- `GET /api/admin/tour-bookings` now EXCLUDES taxi bookings (filter `adminNotes.type==='taxi-booking'` in JS) so the Tour Bookings page shows only Day Tours; taxi inquiries live on the separate `AdminTaxiBookings` page.
- Navigation/back-button + reload-blank fix (`src/lib/store.ts`, `src/app/page.tsx`, `src/app/[...slug]/page.tsx`, `src/components/hotel/HotelDetail.tsx`):
  - Reload-blank FIXED via catch-all route: `src/app/[...slug]/page.tsx` mirrors `src/app/page.tsx` (both render the SPA `Home` switch on `useAppStore.currentView`); deep-link sub-paths (`/hotel/:id`, `/package/:id/book`, etc.) now render after reload/refresh (verify: deep-link returns 200 + rendered content). `resolveFromURL()` maps path → `{view, packageId, destinationId}`; `popstate` re-applies it.
  - `getPathForView()` now substitutes the real `:id`/`:slug` from `selectedPackageId`/`selectedDestinationId` so the address bar shows actual paths (e.g. `/hotel/<id>`), not literal `/hotel/:id`.
  - On-page Back uses a **navHistory stack** (`navHistory: NavEntry[]` in the store): `navigate` pushes the previous `{view, packageId, destinationId, sourceView}` (capped 50, skipped on same-view re-nav), `goBack` pops and restores it — so detail→Back→listing and booking→Back→detail→Back→listing all work (verified headless). `sourceView` is kept for compat but no longer drives `goBack`.
  - `HotelDetail` back button was UNCLICKABLE (absolute `top-4 left-4 z-10` sat behind the hero `<img>` — `elementFromPoint` returned the IMG). Moved to **flow position below the activity bar** (`position: static`, y~648px) — no longer fixed/overlay. `PackageBookingForm` 3 back buttons and `CompanyDetail` (via shared `src/components/ui/BackButton.tsx`) use `goBack()`.
  - All detail/booking back buttons now use `goBack()` instead of hardcoding navigation (which caused "back goes to wrong page"): `PackageDetail` (`goBack(viewMap[category])`), `DestinationDetail` (`goBack()`), `BlogSingle` (`goBack('blog-archive')` — 2 buttons incl. the "Article not found" fallback). `goBack(fallbackView?)` falls back to `fallbackView || 'landing'` when `navHistory` is empty (deep-link/refresh entry), so deep-linked detail pages still have a sensible Back (verified: destination→`/`, blog→`/blog`, package→its listing).
  - Detail pages (`hotel-detail`, `package-detail`, `package-booking`, `company-detail`, `blog-single`, `blog-archive`) now show the **standard navbar + ActivityBar** (removed from `hideNavbarViews` in `page.tsx`). `ActivityBar` renders after `Navbar` for all non-landing, non-listing views. `HotelDetail` no longer renders its own `<Navbar />` (removed duplicate). Back button sits in flow below the activity bar.
  - Hotel/Camping detail is reached via `StayPackageView.handleViewDetails/handleBook` (both categories share `hotel-detail`); camp listing = `camping-packages`, hotel listing = `hotel-packages`.
- Booking date fields: `Booking.checkIn` (DateTime), `PackageBooking.preferredDate` (DateTime), `TourBooking.travelDate` (String ISO). Taxi bookings = `tourBooking` rows with `adminNotes.type==='taxi-booking'`.


