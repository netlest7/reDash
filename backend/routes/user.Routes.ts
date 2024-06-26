import express from "express"
import { activateOwner, getAllOwners, getDetailsOfLoggedInOwner, getOwnerById, loginOwner, logoutOwner, me, signUpUser, updateAccessToken, updateOwner, updateOwnerById, updatePassword } from "../controllers/user.Controller";
import { isAuthenticatedUser } from "../middleware/auth";

const userRouter = express.Router();


userRouter.post('/signup',signUpUser)
userRouter.post('/activateUser',activateOwner)
userRouter.post('/loginOwner',loginOwner)
userRouter.get('/activateToken',updateAccessToken)
userRouter.get('/logout',isAuthenticatedUser,logoutOwner)

userRouter.get('/getOwner/:id',isAuthenticatedUser,getOwnerById)
userRouter.get('/getLoggedInUserDetails',isAuthenticatedUser,getDetailsOfLoggedInOwner)
userRouter.get('/me',isAuthenticatedUser,me)
userRouter.put('/updatePassword',isAuthenticatedUser,updatePassword)
userRouter.put('/updateUser',isAuthenticatedUser,updateOwner)

//  Admin
userRouter.get('/getAllOwners',isAuthenticatedUser,getAllOwners)
userRouter.put('/updateOwnerByID/:id',isAuthenticatedUser,updateOwnerById)



export default userRouter;