const express = require('express');
const router = express.Router();
const Registration = require('../controller/authentication/registration');
const cityData = require('../controller/building/cityController');
const Profile = require('../controller/authentication/profileController');
const Notification = require('../controller/notification/notification');
const UserLock = require('../middlewares/account-lock-email');
const IPLock = require('../middlewares/account-lock-ip');
const Login = require('../controller/authentication/login');
const { googleAuthTokenVerify } = require('../helpers/gmail');
const { linkedinVerify } = require('../helpers/linkedin');
const { auth } = require('../middlewares/auth');
const { login } = require('../helpers/joi-validation');
router.post(
    '/register/email',
    Registration.registerWithEmailAndPassword,
);

router.post('/email-verify', Registration.emailVerify);
router.post('/resend-email', Registration.resendEmailVerification);
router.post('/forgot-password', Registration.forgotPasswordLink);
router.post('/reset-password', Registration.resetPassword);
router.post('/login',  Login.login);

router.get('/get-all-city', cityData.getAllcity)

router.post('/register/google',  googleAuthTokenVerify, Registration.registerWithGoogle);
router.post('/register/linkedin',  linkedinVerify, Registration.registerWithLinkedin);


router.use(auth);
router.post('/token', Login.refreshToken);
router.get('/profile', Profile.getUserProfile);
router.patch('/profile', Profile.updateUserProfile);
router.post('/change-password', Profile.changePassword);
router.get('/wallet-transaction', Profile.walletTransaction);
router.get('/get-all-notification', Notification.getAll);
router.get("/read-notification/:_id", Notification.readById)




module.exports = router;