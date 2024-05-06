import express from "express";
import { createOder, getAllOrders, orderStatus } from "../controllers/order.Controllers";
const ordersRouter = express.Router();


// creating orders
ordersRouter.post("/createOder/:storeId",createOder)

// order served
ordersRouter.post("/orderStatus",orderStatus)

// get all orders
ordersRouter.get("/getAllOrders/:storeId",getAllOrders)

export default ordersRouter;



