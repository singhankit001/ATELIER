# ATELIER — Manual Device QA Checklist

This is a step-by-step script for physically testing the built APK on a real Android device. It exists because the environment this app was hardened in has **no `adb`, no Android emulator, and no touch-automation tool** (Maestro/Detox/Appium/idb) — so every item below is genuinely untested on a device until a human runs through it. Nothing in this file should be read as "already passed."

Install the APK first — see the **Android APK** section of `README.md` for the current build link, or run `eas build --platform android --profile preview` yourself.

Check each box as you go. If something fails, note it in the "Notes" line under that item rather than silently skipping it.

---

## 1. Registration

- [ ] Valid registration (all fields filled correctly) succeeds and lands you in the app
- [ ] Empty full name → inline error, submit blocked
- [ ] Invalid email (e.g. `not-an-email`) → inline error, submit blocked
- [ ] Empty gender → inline error, submit blocked
- [ ] Invalid mobile (letters) → inline error, submit blocked
- [ ] Mobile < 10 digits → inline error, submit blocked
- [ ] Mobile > 10 digits → inline error, submit blocked
- [ ] Empty address → inline error, submit blocked
- [ ] Empty city → inline error, submit blocked
- [ ] Password < 6 characters → inline error, submit blocked
- [ ] Password / confirm-password mismatch → inline error on confirm field, submit blocked
- [ ] Duplicate email (register the same email twice) → toast: "An account with this email address already exists."
- [ ] After a successful registration, close and reopen the app, log in with the same credentials — confirms the account was actually persisted, not just held in memory

Notes: _______________________________________________

## 2. Login

- [ ] Valid email + password (seed account `test@example.com` / `password`) → succeeds, navigates into the app
- [ ] Wrong password → generic error toast, no crash
- [ ] Unknown email → the *same* generic error toast as wrong password (by design — never reveals which one was wrong)
- [ ] Empty email → inline validation error, submit blocked
- [ ] Empty password → inline validation error, submit blocked
- [ ] Rapidly double-tap "Enter ATELIER" during a slow network — confirm only one login attempt fires, button shows a spinner and is disabled, no duplicate navigation

Notes: _______________________________________________

## 3. Session Persistence

- [ ] Register or log in
- [ ] Force-close the app (swipe away from recent apps, not just background it)
- [ ] Reopen — you should land directly in the Gallery, still authenticated
- [ ] Go to Profile → Logout → confirm
- [ ] Force-close the app
- [ ] Reopen — you should land on the Login screen

Notes: _______________________________________________

## 4. Gallery

- [ ] Gallery loads and shows real photos (not placeholders/broken images)
- [ ] Exactly 2 columns, cards aligned in a clean grid
- [ ] Card image aspect ratio is consistent across all cards
- [ ] Author name is visible under each image
- [ ] Image ID is visible under each image
- [ ] Tapping the heart icon on a card favorites it (heart fills/animates)
- [ ] Scrolling is smooth — no visible jank on a normal scroll speed
- [ ] Repeat gallery load/scroll on Wi-Fi
- [ ] Repeat on a throttled/weak connection if you can simulate one (airplane mode toggle mid-load, or a slow hotspot) — confirm a loading state appears rather than a frozen screen

Notes: _______________________________________________

## 5. Pull-to-Refresh

- [ ] Open gallery, scroll down several pages
- [ ] Pull down to refresh
- [ ] A refresh spinner appears
- [ ] Grid returns to page-1 content — no duplicate images, no leftover cards from deep pages
- [ ] No visible layout jump/flash during the refresh

Notes: _______________________________________________

## 6. Infinite Pagination

- [ ] Scroll to the bottom of page 1 — page 2 loads automatically
- [ ] Continue through pages 3 and 4
- [ ] No duplicate images appear across pages
- [ ] No flicker when new items are appended
- [ ] Footer spinner appears while loading, disappears once the page lands
- [ ] Scroll very fast to the bottom repeatedly — confirm it doesn't fire duplicate/overlapping page requests (watch the footer spinner behavior; it shouldn't get "stuck" spinning indefinitely)

Notes: _______________________________________________

## 7. Search + Filter

- [ ] Search "a", Filter: All → matching results by author/id containing "a"
- [ ] Search "a", Filter: A–M → intersection of both
- [ ] Search "a", Filter: N–Z → intersection of both
- [ ] Search "", Filter: A–M → all A–M authors
- [ ] Search "", Filter: N–Z → all N–Z authors
- [ ] Search something with no matches (e.g. "zzzzz") → empty state with a "Clear Search" action, not a blank screen
- [ ] Type in mixed case (e.g. "ALICE" vs "alice") → same results either way
- [ ] Results update immediately as you type (after the brief debounce), no need to press enter/search

Notes: _______________________________________________

## 8. Favorites

- [ ] From Gallery, favorite Image A, then favorite Image B
- [ ] Go to Favorites tab — both appear
- [ ] Remove Image A from Favorites
- [ ] Return to Gallery — Image A's heart is no longer filled
- [ ] Force-close the app, reopen, go to Favorites — Image B is still there, Image A is not

Notes: _______________________________________________

## 9. Image Viewer

- [ ] Tap an image in the gallery — the correct image opens full-screen
- [ ] Author and ID are shown
- [ ] Download button is visible
- [ ] Pinch to zoom in works
- [ ] Pan around while zoomed in works
- [ ] Double-tap zooms in/out
- [ ] Zoom resets when you close and reopen the viewer (open a different image after zooming the first — it should start unzoomed)
- [ ] Android back button closes the viewer instead of leaving the app or the app in a broken state
- [ ] Very fast repeated pinching doesn't freeze the image or the gesture
- [ ] Pan immediately (before any zoom) triggers swipe-to-dismiss instead of a broken pan
- [ ] Open → close → open → close rapidly, several times — viewer never gets stuck open or stuck blank

Notes: _______________________________________________

## 10. Download — highest priority, test for real

- [ ] Open an image, tap Download
- [ ] If prompted, allow the permission dialog
- [ ] Download completes — button shows a success checkmark briefly
- [ ] Open the device's Photos/Gallery app — confirm the downloaded image is actually there
- [ ] Deny the permission dialog instead (may require reinstalling or clearing app permissions first to see the prompt again) — confirm the app shows a clear error and remains usable, not stuck or crashed
- [ ] Rapidly tap Download multiple times on the same image — confirm only one download/save happens, no duplicate files in the photo library, button stays in a sane state throughout
- [ ] Try downloading with the network disabled/interrupted mid-download — confirm a clear failure message, not a hang or crash

Notes: _______________________________________________

## 11. Sharing

- [ ] Open an image, tap Share
- [ ] Native Android share sheet opens with the image attached
- [ ] Dismissing the share sheet without picking an app does **not** show an error (this is intentional — cancel and success look the same from the app's side)

Notes: _______________________________________________

## 12. Profile

- [ ] All profile fields that have data are displayed
- [ ] "Update Patron Credentials" opens Edit Profile with existing values pre-filled
- [ ] Change Name, Mobile, Gender, Address, City — Save
- [ ] UI updates immediately to reflect the new values
- [ ] Force-close and reopen — changes are still there
- [ ] Try saving an invalid mobile number (e.g. 5 digits) in Edit Profile — should be rejected with an error, same as registration

Notes: _______________________________________________

## 13. Logout

- [ ] Profile → Logout → confirmation dialog appears
- [ ] Confirm → returns to Login
- [ ] Press Android back button from the Login screen after logging out — confirm you do **not** land back on an authenticated screen (Gallery/Profile/etc.)

Notes: _______________________________________________

## 14. Android Back Button Audit

Press the Android back button on each of these screens and confirm sensible behavior (no dead ends, no crash, no landing somewhere broken):

- [ ] Login
- [ ] Register (should return to Login)
- [ ] Gallery
- [ ] Favorites
- [ ] Profile
- [ ] Image Viewer (should close the viewer, confirmed above in section 9)
- [ ] Edit Profile modal (should close the modal without saving unsaved changes)

Notes: _______________________________________________

## 15. Keyboard QA

On Login, Register, and Edit Profile:

- [ ] Keyboard does not visually cover the field you're typing into
- [ ] You can still reach and tap the submit button while the keyboard is open
- [ ] Scrolling the form works normally with the keyboard open
- [ ] Password fields mask input correctly and the show/hide toggle (if present) works
- [ ] Tapping outside a field dismisses the keyboard
- [ ] No layout overflow/clipping on your device's screen size

Notes: _______________________________________________

## 16. Visual / UI Polish

- [ ] Buttons, cards, icons, labels, inputs, filter chips, tabs, and modals all appear consistently spaced/aligned — nothing visibly off-grid
- [ ] Text hierarchy is legible — headings vs. body vs. captions look intentionally different, no truncation cutting off important text mid-word unexpectedly
- [ ] Glass cards are readable — text/icons on top of them aren't washed out by the blur/glow
- [ ] Grid cards stay the same height regardless of author name length (long vs. short names)
- [ ] Dark mode: switch in Profile, confirm every screen (not just some) reflects it
- [ ] Light mode: same check

Notes: _______________________________________________

## 17. Performance

- [ ] Scrolling the gallery grid stays smooth even after loading 4+ pages
- [ ] No visible stutter when toggling a favorite mid-scroll
- [ ] App doesn't visibly slow down after several minutes of use (navigating between tabs repeatedly)

Notes: _______________________________________________

## 18. Offline / Failure Resilience

- [ ] Turn on airplane mode, open the app fresh (or pull-to-refresh) — gallery shows an error state with a retry button, not a crash or infinite spinner
- [ ] Turn network back on, tap Retry — gallery loads normally
- [ ] Turn on airplane mode, try Download — clear error, app stays usable
- [ ] Turn on airplane mode before logging in — login attempt fails gracefully with an error toast (no crash)

Notes: _______________________________________________

## 19. Fresh APK Install Test

This is the real acceptance test — repeat a full flow on a **clean install** of the actual built APK (not the Expo Go dev client):

- [ ] Uninstall any existing dev/Expo Go version of this app from the device
- [ ] Install the APK from the link in `README.md`
- [ ] Launch → Register a new account → Login (or stay logged in from registration)
- [ ] Gallery → Search → Filter → Favorite an image
- [ ] Favorites tab → confirm the favorite is there
- [ ] Open the Viewer on an image → Download it → confirm it's in Photos
- [ ] Profile → Edit Profile → change a field → Save
- [ ] Logout

Notes: _______________________________________________

---

## Result summary

| Section | Pass / Fail / Partial | Notes |
| :--- | :--- | :--- |
| 1. Registration | | |
| 2. Login | | |
| 3. Session Persistence | | |
| 4. Gallery | | |
| 5. Pull-to-Refresh | | |
| 6. Infinite Pagination | | |
| 7. Search + Filter | | |
| 8. Favorites | | |
| 9. Image Viewer | | |
| 10. Download | | |
| 11. Sharing | | |
| 12. Profile | | |
| 13. Logout | | |
| 14. Back Button | | |
| 15. Keyboard | | |
| 16. Visual Polish | | |
| 17. Performance | | |
| 18. Offline Resilience | | |
| 19. Fresh APK Install | | |

Device tested on: _______________ (model, Android version)
Date: _______________
Tester: _______________
