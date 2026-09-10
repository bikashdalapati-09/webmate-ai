import Billing from "../Models/billing.model.js";
import User from "../Models/user.model.js";
import { razorpay } from "../services/razorpay.js";
import crypto from 'crypto';

export const createOrder = async (req, res) => {
    try {
        const { plan, duration } = req.body;
        const userId = req.userId;

        if (!plan || !duration) {
            return res.status(400).json({
                success: false,
                message: "Plan and duration are required"
            });
        }

        let amount = 0;
        if (plan === "pro") {
            amount = (duration === "monthly") ? 19 : 180;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid plan selected"
            });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        // Store duration in Billing record so we can compute correct expiry during verification
        await Billing.create({
            userId,
            amount,
            plan,
            duration,
            orderId: order.id
        });

        return res.json({
            success: true,
            order
        });

    } catch (error) {
        console.log("Error creating Razorpay order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order. Please try again.",
            error: error.message
        });
    }
};

export const verifyBilling = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.userId;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details"
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY_KEY_SECRET is not set in environment variables");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        // HMAC Signature Verification
        const sign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (sign !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment Verification failed - Invalid signature"
            });
        }

        // Update Billing status and retrieve duration
        const billingDoc = await Billing.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                status: "paid"
            },
            { returnDocument: 'after' } // Replaced deprecated 'new: true'
        );

        // Dynamically calculate expiry date based on monthly vs yearly duration
        const durationDays = billingDoc?.duration === "yearly" ? 365 : 30;
        const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        // Update User state using Mongoose's modern 'returnDocument' option
        const user = await User.findByIdAndUpdate(
            userId,
            {
                plan: "Pro",
                planStartDate: new Date(),
                planExpiryDate: expiryDate
            },
            { returnDocument: 'after' } // Fixes deprecation warning
        );

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.log("Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};