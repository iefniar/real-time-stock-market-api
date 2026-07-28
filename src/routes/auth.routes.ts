import { Router } from 'express'
import {
  sendWelcomeVerificationEmail,
  forgotPassword
} from '../controllers/auth.controller.ts'

const router = Router()

router.post('/sign-up', sendWelcomeVerificationEmail)

router.post('/forgot-password', forgotPassword)

export default router
