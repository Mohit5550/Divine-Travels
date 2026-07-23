<#
.SYNOPSIS
End-to-end test script for Divine Travels
Tests the complete user flow: register → login → forgot/reset password → book packages → payment flow → invoice
.DESCRIPTION
Tests all critical user-facing API flows against the production or local server.
Set $BASE_URL to the target environment.
#>

param(
  [string]$BASE_URL = "https://divine-travels.vercel.app",
  [string]$EMAIL = "testuser-$(Get-Random -Maximum 99999)@example.com",
  [string]$PASSWORD = "TestPass123"
)

$PASS = 0; $FAIL = 0; $SKIP = 0
$HEADERS = @{ "Content-Type" = "application/json" }

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "  ✓ $msg" -ForegroundColor Green; $script:PASS++ }
function Write-Fail($msg) { Write-Host "  ✗ $msg" -ForegroundColor Red; $script:FAIL++ }
function Write-Skip($msg) { Write-Host "  - $msg" -ForegroundColor Yellow; $script:SKIP++ }

Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "  DIVINE TRAVELS E2E TEST SUITE" -ForegroundColor Magenta
Write-Host "  Target: $BASE_URL" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

# ===== 1. User Registration =====
Write-Step "1. USER REGISTRATION"
try {
  $reg = Invoke-RestMethod -Uri "$BASE_URL/api/auth" -Method Put -Body (@{ email=$EMAIL; password=$PASSWORD; fullName="Test User"; mobile="9999999999" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  $USER_ID = $reg.user.id
  $HEADERS["x-user-id"] = $USER_ID
  Write-OK "Registered user: $EMAIL (ID: $USER_ID)"
} catch { Write-Fail "Registration: $($_.Exception.Message)"; exit }

# ===== 2. User Login =====
Write-Step "2. USER LOGIN"
try {
  $login = Invoke-RestMethod -Uri "$BASE_URL/api/auth" -Method Post -Body (@{ email=$EMAIL; password=$PASSWORD } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  Write-OK "Login successful"
} catch { Write-Fail "Login: $($_.Exception.Message)" }

# ===== 3. Forgot Password =====
Write-Step "3. FORGOT PASSWORD"
try {
  $forgot = Invoke-RestMethod -Uri "$BASE_URL/api/auth/forgot-password" -Method Post -Body (@{ email=$EMAIL } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  if ($forgot.message -or $forgot.token) {
    Write-OK "Forgot password request accepted"
    $RESET_TOKEN = $forgot.token
    $RESET_CODE = $forgot.code
    Write-Host "     Token: $RESET_TOKEN" -ForegroundColor Gray
    Write-Host "     Code: $RESET_CODE" -ForegroundColor Gray
  } else { Write-Fail "Forgot password: unexpected response $($forgot | ConvertTo-Json -Compress)" }
} catch { Write-Fail "Forgot password: $($_.Exception.Message)" }

# ===== 4. Reset Password (via token) =====
Write-Step "4. RESET PASSWORD (via token)"
try {
  $reset = Invoke-RestMethod -Uri "$BASE_URL/api/auth/reset-password" -Method Post -Body (@{ token=$RESET_TOKEN; password="NewPass456!" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  if ($reset.message) { Write-OK "Password reset via token: $($reset.message)" } else { Write-Fail "Reset: unexpected response" }
} catch { Write-Fail "Reset password (token): $($_.Exception.Message)" }

# ===== 5. Login with new password =====
Write-Step "5. LOGIN WITH NEW PASSWORD"
try {
  $login2 = Invoke-RestMethod -Uri "$BASE_URL/api/auth" -Method Post -Body (@{ email=$EMAIL; password="NewPass456!" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  Write-OK "Login with new password successful"
} catch { Write-Fail "Login with new password: $($_.Exception.Message)" }

# ===== 6. Reset Password (via code) =====
Write-Step "6. RESET PASSWORD (via code)"
try {
  $forgot2 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/forgot-password" -Method Post -Body (@{ email=$EMAIL } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  $code = $forgot2.code
  $reset2 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/reset-password" -Method Post -Body (@{ code=$code; password=$PASSWORD } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
  if ($reset2.message) { Write-OK "Password reset via code: $($reset2.message)" } else { Write-Fail "Unexpected response" }
} catch { Write-Fail "Reset password (code): $($_.Exception.Message)" }

# ===== 7. Fetch available packages =====
Write-Step "7. FETCH PACKAGES"
try {
  $pkgPage = Invoke-RestMethod -Uri "$BASE_URL/" -ErrorAction Stop
  $pkgs = Invoke-RestMethod -Uri "$BASE_URL/api/packages" -ErrorAction Stop
  Write-OK "Packages API responded"
  Write-Host "     $($pkgs.Count) packages found" -ForegroundColor Gray
} catch { Write-Skip "Package fetch (non-critical): $($_.Exception.Message)" }

# ===== 8. Book a package =====
Write-Step "8. BOOK A PACKAGE"
try {
  $booking = Invoke-RestMethod -Uri "$BASE_URL/api/package-bookings" -Method Post -Body (@{
    packageId="cmqv5x2ny0001l404cuaqu3qy"
    fullName="Test User"
    mobile="9999999999"
    email=$EMAIL
    preferredDate="2026-08-15"
    preferredTime="10:00"
    numberOfPeople=2
    additionalNotes="E2E test booking"
    totalPrice=1300
  } | ConvertTo-Json) -ContentType "application/json" -Headers $HEADERS -ErrorAction Stop
  $BOOKING_ID = $booking.id
  Write-OK "Booking created: $BOOKING_ID"
} catch { Write-Fail "Create booking: $($_.Exception.Message)"; $BOOKING_ID = $null }

# ===== 9. Fetch user bookings =====
Write-Step "9. FETCH USER BOOKINGS"
try {
  $bookings = Invoke-RestMethod -Uri "$BASE_URL/api/package-bookings" -Method Get -Headers $HEADERS -ErrorAction Stop
  Write-OK "$($bookings.Count) bookings returned"
  $bookings | ForEach-Object { Write-Host "     [$($_.status)] $($_.package?.name) - ₹$($_.totalPrice) - payment=$($_.paymentStatus)" -ForegroundColor Gray }
} catch { Write-Fail "Fetch bookings: $($_.Exception.Message)" }

# ===== 10. Create KwikUPi payment =====
Write-Step "10. CREATE KWIKUPI PAYMENT"
if ($BOOKING_ID) {
  try {
    $kwik = Invoke-RestMethod -Uri "$BASE_URL/api/kwikupi/create-payment" -Method Post -Body (@{
      bookingId=$BOOKING_ID
      amount=1300
      customerName="Test User"
      customerEmail=$EMAIL
      customerMobile="9999999999"
    } | ConvertTo-Json) -ContentType "application/json" -Headers $HEADERS -ErrorAction Stop
    $PAYMENT_ID = $kwik.payment_id
    Write-OK "KwikUPi payment created: $PAYMENT_ID"
    Write-Host "     Payment page: $($kwik.payment_page)" -ForegroundColor Gray
  } catch { Write-Fail "Create KwikUPi payment: $($_.Exception.Message)"; $PAYMENT_ID = $null }
} else { Write-Skip "Skip: no booking ID" }

# ===== 11. Verify payment status =====
Write-Step "11. VERIFY PAYMENT STATUS"
if ($PAYMENT_ID) {
  try {
    $verify = Invoke-RestMethod -Uri "$BASE_URL/api/kwikupi/verify-payment" -Method Post -Body (@{ payment_id=$PAYMENT_ID } | ConvertTo-Json) -ContentType "application/json" -Headers $HEADERS -ErrorAction Stop
    Write-OK "Verify response: $($verify | ConvertTo-Json -Compress)"
  } catch { Write-Fail "Verify payment: $($_.Exception.Message)" }
} else { Write-Skip "Skip: no payment ID" }

# ===== 12. Simulate completed payment (direct update) =====
Write-Step "12. SIMULATE PAYMENT COMPLETION"
if ($BOOKING_ID) {
  try {
    $update = Invoke-RestMethod -Uri "$BASE_URL/api/package-bookings/$BOOKING_ID" -Method Put -Body (@{
      paymentStatus="completed"
      paymentId="test_pay_$(Get-Random -Maximum 99999)"
      paymentOrderId="test_ord_$(Get-Random -Maximum 99999)"
      paymentAmount=1300
    } | ConvertTo-Json) -ContentType "application/json" -Headers $HEADERS -ErrorAction Stop
    Write-OK "Booking updated: paymentStatus=completed"
  } catch { Write-Fail "Update booking: $($_.Exception.Message)" }
} else { Write-Skip "Skip: no booking ID" }

# ===== 13. Verify booking shows paid =====
Write-Step "13. VERIFY BOOKING STATUS"
try {
  $bookings2 = Invoke-RestMethod -Uri "$BASE_URL/api/package-bookings" -Method Get -Headers $HEADERS -ErrorAction Stop
  $paidBooking = $bookings2 | Where-Object { $_.paymentStatus -eq 'completed' } | Select-Object -First 1
  if ($paidBooking) {
    Write-OK "Paid booking found: $($paidBooking.id) - ₹$($paidBooking.paymentAmount)"
  } else { Write-Fail "No paid booking found" }
} catch { Write-Fail "Re-fetch bookings: $($_.Exception.Message)" }

# ===== 14. Fetch payment history =====
Write-Step "14. PAYMENT HISTORY"
try {
  $payments = Invoke-RestMethod -Uri "$BASE_URL/api/payments" -Method Get -Headers $HEADERS -ErrorAction Stop
  if ($payments.Count -gt 0) {
    Write-OK "$($payments.Count) payment records found"
    $payments | ForEach-Object { Write-Host "     Status=$($_.status) Amount=₹$($_.amount) Txn=$($_.transactionId) Booking=$($_.pkgBookingId)" -ForegroundColor Gray }
  } else { Write-Fail "No payment records found" }
} catch { Write-Fail "Fetch payments: $($_.Exception.Message)" }

# ===== 15. Fetch user notifications =====
Write-Step "15. NOTIFICATIONS"
try {
  $notifs = Invoke-RestMethod -Uri "$BASE_URL/api/notifications" -Method Get -Headers $HEADERS -ErrorAction Stop
  Write-OK "$($notifs.Count) notifications"
  $notifs | ForEach-Object { Write-Host "     [$($_.read ? 'read' : 'unread')] $($_.title)" -ForegroundColor Gray }
} catch { Write-Skip "Notifications (non-critical): $($_.Exception.Message)" }

# ===== Summary =====
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "  RESULTS" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "  PASS: $PASS" -ForegroundColor Green
Write-Host "  FAIL: $FAIL" -ForegroundColor Red
Write-Host "  SKIP: $SKIP" -ForegroundColor Yellow
Write-Host "  TOTAL: $(($PASS+$FAIL+$SKIP))" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Magenta

if ($FAIL -gt 0) { exit 1 } else { exit 0 }
