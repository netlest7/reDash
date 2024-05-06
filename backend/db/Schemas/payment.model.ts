import mongoose,{Document} from "mongoose";

interface IPayemnt extends Document {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
    createAt: Date;
}
const paymenetSchema = new mongoose.Schema({
    razorpay_payment_id:{
        type:String,
        required: true
    },
    razorpay_subscription_id:{
        type:String,
        required: true
    },
    razorpay_signature:{
        type:String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
})

export const Payment = mongoose.model<IPayemnt>("Owner_Payment",paymenetSchema)