import express from "express"
import { isAuthenticatedUser } from "../middleware/auth";
import { createAndBuySubscription, customerOrderPayment, customerOrderPaymentVerification, paymentVerification } from "../controllers/payment.Controllers";
const paymentRouter = express.Router();


paymentRouter.post('/createSubscription',isAuthenticatedUser,createAndBuySubscription)

paymentRouter.post('/paymentVerification',isAuthenticatedUser,paymentVerification)

// customer payment  and order creation

paymentRouter.post('/itemOderPayment&Creation/:storeId',customerOrderPayment)

paymentRouter.post('/itemOrderPaymentVerification',customerOrderPaymentVerification)

export default paymentRouter;
