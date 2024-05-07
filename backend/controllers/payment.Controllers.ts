import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import Owner from "../db/Schemas/ownerSchema";
import ErrorHandler from "../utils/ErrorHandler";
import instance from "../utils/razorpay.instance";
import instance2 from "../utils/customer.razorpay.instance";
import crypto from "crypto"
import { Payment } from "../db/Schemas/payment.model";
import { OrderPayment } from "../db/Schemas/order.payment";
import Store from "../db/Schemas/store.model";
import { Order } from "../db/Schemas/order.model";
require('dotenv').config()

// create subscription
export const createAndBuySubscription = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{

        const {plan_id} = req.body;
        const owner = await Owner.findById(req.owner?._id);

        if(!owner){
            return next(new ErrorHandler("Please login to continue the purchase",400));
        }


       if(plan_id){
        const subscription = await instance.subscriptions.create({
            plan_id: plan_id,
            customer_notify:1,
            total_count: 12
        })
        
        owner.subscription.id = subscription.id;
        owner.subscription.status = subscription.status

        await owner.save()
        console.log(subscription,"lawda ka subscription");

        const duData = req.body;
        console.log(duData);
        

        res.status(200).json({
            success: true,
            subscriptionId: subscription.id,
            order: subscription
        })
       }



})

// payment Verification
interface IPaymentVerificationInput{
    razorpay_payment_id: string;
    razorpay_subscription_id : string;
    razorpay_signature: string;
}

export const paymentVerification = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    
    const {razorpay_payment_id,razorpay_subscription_id,razorpay_signature} = req.body as IPaymentVerificationInput
    
    console.log(razorpay_payment_id);
    console.log(razorpay_subscription_id);
    console.log(razorpay_signature);
    

    const owner = await Owner.findById(req.owner?._id);

    if(!owner){
        return next(new ErrorHandler("Please login to continue the purchase",400));
    }

    const subscriptionId = owner.subscription.id;

    const generated_Signature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET as string).update(razorpay_payment_id + "|" + subscriptionId,"utf-8").digest("hex");

    const isAuthentic = generated_Signature === razorpay_signature;

    console.log(isAuthentic,"ys bol");
    
    if(!isAuthentic){
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)
    }

    await Payment.create({
        razorpay_payment_id,razorpay_subscription_id,razorpay_signature
    })
    owner.subscription.status = "active";
    await owner.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
})


export const getRazorPayKey = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) => {
    res.status(200).json({
        success:true,
        key: process.env.RAZORPAY_API_KEY
    })
})



// cancel subscription

export const cancelSubscription = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) => {


    const owner = await Owner.findById(req.owner?._id);
    if(!owner){
        return next(new ErrorHandler("Please login to cancel the subscription",400));
    }

    const subscriptionId= owner.subscription.id;


    let refund: boolean = false;

    if(subscriptionId){
        await instance.subscriptions.cancel(subscriptionId);
    }

    const payment:any = await Payment.findOne({
        razorpay_order_id: subscriptionId,
    })

    const gap = Date.now() - payment?.createdAt

  
    if (process.env.REFUND_DAYS) {
        const refundTime: number = parseInt(process.env.REFUND_DAYS) * 24 * 60 * 60 * 1000;

        if(refundTime > gap){

        const paymentId = payment.razorpay_payment_id
         instance.payments.refund(paymentId,{})
            refund = true;
        }
    }

    // await payment.remove()

    owner.subscription.id = undefined
    owner.subscription.status = undefined

    await owner.save()


    res.status(200).json({
        success:true,
        message: refund ? "Subscription cancelled , You will recive full refund within 7 days." : "Subscription cancelled , no refund initiated as subscription was cancelled after 7 days."
    })

})





//  customer payment
export const customerOrderPayment = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{

        const {tableNo,order_cust_name,order_cust_phone,order_type,order_items,totalamount} = req.body;
    
        const store = await Store.findById(req.params.storeId);

        
    
        if(!store){
            return next(new ErrorHandler("QR is not valid. Please contact the shop owner.",400));
        }

    
        if(tableNo && order_cust_name && order_cust_phone){
            
        const options = {
                amount: Number(totalamount * 100),
                currency: "INR",
                        }

        const orderRequest = await instance2.orders.create(options)
    
        const order = await Order.create({
                table_number:tableNo,
                order_cust_name,
                order_cust_phone,
                store_id: req.params.storeId,
                order_type,
                order_items,
                orderId: orderRequest.id
        })
    


    console.log(orderRequest,"yes");

    res.status(200).json({
        success: true,
        order,
        orderRequest
    })
}
})

export const customerOrderPaymentVerification = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id
    var expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_API_SECRET as string)
        .update(body.toString()).digest('hex');

    if(expectedSignature === razorpay_signature){

      const order = await Order.findOne({orderId: razorpay_order_id})

      if(order){
        order.paymentStatus = !order.paymentStatus

      }
      await order?.save();
    res.redirect(`https://schedule-message-6ed2c.web.app/Bill?reference=${razorpay_payment_id}&order=${order}`)
    return

    }else{

        const order = await Order.deleteOne({orderId: razorpay_order_id})

        res.status(200).json({
            success: false,
            message: "Something went wrong"
        })
       res.redirect(`http://localhost:5174/paymentfail`)
       return

    }
    
})