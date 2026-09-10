# Razorpay Test Mode Setup Guide

## Fixed Issues ✅
1. **Plan name mismatch**: Changed from lowercase "pro" to capitalized "Pro" to match User model enum
2. **Field name typo**: Changed `proExipireAt` to `planExpiryDate` for consistency
3. **Missing error handling**: Added proper error responses in both createOrder and verifyBilling
4. **Input validation**: Added validation for required fields in both endpoints
5. **Environment validation**: Added check for RAZORPAY_KEY_SECRET

## Environment Setup

### 1. Get Razorpay Test Keys
- Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Navigate to Settings → API Keys
- Switch to "Test Mode"
- Copy the Key ID and Key Secret

### 2. Set Environment Variables (.env)

Add these to your **server/.env** file:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

Add this to your **client/.env** file:
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

⚠️ **Important**: Never commit these keys to version control. Add `.env` to `.gitignore`

## Test Mode Configuration

### Test Cards for Razorpay

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: Any future date

## API Endpoints

### 1. Create Order
**POST** `/api/billing/order`

**Headers:**
```
Cookie: token=<auth_token>
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "pro",
  "duration": "monthly"
}
```

**Duration options:**
- `"monthly"` → ₹19 INR
- `"yearly"` → ₹180 INR

**Response (Success):**
```json
{
  "success": true,
  "order": {
    "id": "order_xxxxx",
    "amount": 1900,
    "currency": "INR",
    "receipt": "receipt_1234567890"
  }
}
```

### 2. Verify Payment
**POST** `/api/billing/verify`

**Headers:**
```
Cookie: token=<auth_token>
Content-Type: application/json
```

**Body:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "plan": "Pro",
    "planStartDate": "2026-09-11T10:30:00.000Z",
    "planExpiryDate": "2026-10-11T10:30:00.000Z",
    ...
  }
}
```

## Database Schema

### Billing Record
```javascript
{
  userId: ObjectId,        // Reference to User
  amount: Number,          // ₹ Amount (without decimals)
  plan: String,            // "pro"
  paymentId: String,       // Razorpay payment ID
  orderId: String,         // Razorpay order ID
  status: String,          // "created", "paid", "failed"
  createdAt: Date,
  updatedAt: Date
}
```

### User Record (Updated on successful payment)
```javascript
{
  plan: "Pro",                    // Upgraded from "Free"
  planStartDate: Date,            // Payment date
  planExpiryDate: Date,           // 30 days from planStartDate
  ...
}
```

## Testing Checklist

- [ ] Environment variables set in server/.env
- [ ] VITE_RAZORPAY_KEY_ID set in client/.env
- [ ] Server running on port 8000 (or configured port)
- [ ] Database connected
- [ ] Click "Upgrade to Pro" button in Billing page
- [ ] Razorpay modal opens
- [ ] Enter test card: 4111 1111 1111 1111
- [ ] Complete payment
- [ ] User plan updated to "Pro"
- [ ] Plan expiry date set to 30 days from now
- [ ] Dashboard shows "Pro Plan" with remaining days

## Troubleshooting

### Issue: "RAZORPAY_KEY_SECRET is not set"
**Solution:** Add RAZORPAY_KEY_SECRET to server/.env and restart the server

### Issue: "Payment Verification failed - Invalid signature"
**Solution:** 
- Verify the Key Secret is correct
- Ensure you're using test keys, not live keys
- Check that signature generation is using correct format: `order_id|payment_id`

### Issue: Order creation fails
**Solution:**
- Ensure plan is "pro" (lowercase in request)
- Ensure duration is either "monthly" or "yearly"
- Check server console for error details

### Issue: Payment successful but user plan not updated
**Solution:**
- Check if user exists in database
- Verify authentication token is valid
- Check server logs for database update errors

## Frontend Integration

The Billing.jsx component handles:
1. Plan selection (monthly/yearly)
2. Creating Razorpay order via `/api/billing/order`
3. Opening Razorpay checkout modal
4. Handling payment response
5. Verifying payment via `/api/billing/verify`
6. Updating user state with new plan

## Next Steps

1. Update payment tier prices if needed
2. Add email notifications for successful upgrades
3. Implement plan renewal logic
4. Add payment history/receipt generation
5. Setup live mode keys for production

## References

- [Razorpay Docs](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/api/payments/payments-create/#test-cards)
- [Razorpay Integration Guide](https://razorpay.com/docs/payments/server-side-integration/)
