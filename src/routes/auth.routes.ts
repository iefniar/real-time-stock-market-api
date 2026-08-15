import { Router } from 'express'
import {
  sendWelcomeVerificationEmail,
  forgotPassword
} from '../controllers/auth.controller.js'
import { deleteAccountByToken } from '../controllers/delete-account.controller.js'

const router = Router()

router.post('/sign-up', sendWelcomeVerificationEmail)

router.post('/forgot-password', forgotPassword)

router.post('/delete-account-by-token', deleteAccountByToken)

export default router
