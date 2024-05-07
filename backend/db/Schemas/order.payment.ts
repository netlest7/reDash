import mongoose from "mongoose";

const orderPaymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        require: true
    },
    razorpay_payment_id: {
        type: String,
        require: true
    },
    razorpay_signature: {
        type: String,
        require: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },
})

export const OrderPayment = mongoose.model("orderPayment",orderPaymentSchema)