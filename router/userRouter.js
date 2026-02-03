var express = require("express");
var route = express.Router();
var { verifyToken, Userauthorize, ActiveAccount } = require('../middleware/authMiddleware')

var { RegisterPhoneNumber, VerifyOtp, UpdateProfile, ListUser, deleteuser, ResubmitProfile, DeleteProfileImage, SearchUser } = require('../controller/user/register')
route.post('/register', RegisterPhoneNumber)
route.post('/register/verify-otp', VerifyOtp)
route.post('/update/profile', verifyToken, Userauthorize('user'), UpdateProfile)
route.post('/view/profile', verifyToken, Userauthorize('user'), ListUser)
route.post('/delete/profile', verifyToken, Userauthorize('user'), deleteuser)
route.post('/resubmit/profile', verifyToken, Userauthorize('user'), ResubmitProfile)
route.post('/delete/profile-image', verifyToken, Userauthorize('user'), DeleteProfileImage)
route.post('/search/user', verifyToken, Userauthorize('user'), ActiveAccount, SearchUser)


var { UpdatePartnerPreference } = require('../controller/user/partnerPreference')
route.post('/update/partner-preference', UpdatePartnerPreference)

var { LoginWithOtp, LoginVerifyOtp, LogOut } = require('../controller/user/login')
route.post('/login', LoginWithOtp)
route.post('/login/verify-otp', LoginVerifyOtp)
route.post('/logout', verifyToken, LogOut)


var { ListPartnerPreference } = require('../controller/user/partnerPreference')
route.post('/list/partner-preference', verifyToken, Userauthorize('user'), ListPartnerPreference)

var { FindMatchingUsers, ListAcceptedMatches } = require('../controller/user/matches')
route.post('/find/match', verifyToken, Userauthorize('user'), ActiveAccount, FindMatchingUsers)
route.post('/accepted-matches', verifyToken, Userauthorize('user'), ActiveAccount, ListAcceptedMatches)

var { setVisibility } = require('../controller/user/fieldVsibility')
route.post('/update/field-visibility', setVisibility)

var { SendInterest, ListInterests, ListBlockedUser, UpdateInterestStatus, ListIncomingInterests, DeleteSendedInterests, SendDislike, SendBlock, SendUnBlock } = require('../controller/user/interest')
route.post('/send/interest', verifyToken, Userauthorize('user'), ActiveAccount, SendInterest)
route.post('/send/dislike', verifyToken, Userauthorize('user'), ActiveAccount, SendDislike)
route.post('/send/block', verifyToken, Userauthorize('user'), ActiveAccount, SendBlock)
route.post('/send/unblock', verifyToken, Userauthorize('user'), SendUnBlock)
route.post('/list/send/interest', verifyToken, Userauthorize('user'), ActiveAccount, ListInterests)
route.post('/delete/send/interest', verifyToken, Userauthorize('user'), ActiveAccount, DeleteSendedInterests)
route.post('/list/incoming/interest', verifyToken, Userauthorize('user'), ActiveAccount, ListIncomingInterests)
route.post('/update/incoming/interest', verifyToken, Userauthorize('user'), ActiveAccount, UpdateInterestStatus)
route.post('/list/block', verifyToken, Userauthorize('user'), ActiveAccount, ListBlockedUser)

var { ViewUsers } = require('../controller/user/viewUsers')
route.post('/view/partner-profile', verifyToken, Userauthorize('user'), ActiveAccount, ViewUsers)

var { ProfileVist, ListProfileVisit, ListRejectInterest } = require('../controller/user/profileVisit')
route.post('/add/profile-visit', verifyToken, Userauthorize('user'), ProfileVist)
route.get('/list/profile-visit', verifyToken, Userauthorize('user'), ActiveAccount, ListProfileVisit)
route.get('/list/interest-rejected', verifyToken, Userauthorize('user'), ActiveAccount, ListRejectInterest)

var { ViewProfile } = require('../controller/user/viewUsers')
route.post('/profile-view', ViewProfile)

var { processPayment, PaymentOrderId } = require('../controller/user/payment')
route.post('/process/payment', verifyToken, Userauthorize('user'), ActiveAccount, processPayment)
route.post('/payment/order-id', verifyToken, Userauthorize('user'), ActiveAccount, PaymentOrderId)

var { ListNotification, ReadNotification } = require('../controller/user/notificationlist')
route.post('/list/notification', verifyToken, ActiveAccount, ListNotification)
route.put('/read/notification', verifyToken, ActiveAccount, ReadNotification)

var { ListHabit } = require('../controller/admin/habit')
route.get('/list/habit', ListHabit)

var { ListHobbies } = require('../controller/admin/hobbies')
route.get('/list/hobbies', ListHobbies)

var { ListProfileTags } = require('../controller/admin/profileTags')
route.get('/list/profile-tags', ListProfileTags)

var { Listreligion, ListCommunity } = require('../controller/admin/religionCommunity')
route.get('/list/religion', Listreligion)
route.get('/list/community', ListCommunity)

var { ListAllPlans } = require('../controller/admin/plans')
route.get('/list/plans', verifyToken, ListAllPlans)

var { ListAddOnPlans } = require('../controller/admin/addOnplan')
route.get('/list/addon-plans', verifyToken, ListAddOnPlans)

var { ListWorkLocationQualification } = require('../controller/user/viewUsers')
route.post('/list/filter-data', verifyToken, ListWorkLocationQualification)

var { ListLanguage } = require('../controller/admin/language')
route.get('/list/language', ListLanguage)

var { ChangePhoneNumber, ChangeMobileVerifyOtp } = require('../controller/user/changeMobile')
route.post('/change/mobile', verifyToken, ActiveAccount, ChangePhoneNumber)
route.post('/change/mobile/verify-otp', verifyToken, ActiveAccount, ChangeMobileVerifyOtp)

var { AllUsers } = require('../controller/user/viewUsers')
route.post('/list/all-profiles', verifyToken, Userauthorize('user'), ActiveAccount, AllUsers)

var { ListFaq } = require('../controller/admin/faq')
route.get('/list/faq', ListFaq)

var { ListCountry } = require('../controller/admin/locations')
route.get('/list/country', ListCountry)

var { ListStates } = require('../controller/admin/locations')
route.get('/list/states', ListStates)

var { ListDistricts } = require('../controller/admin/locations')
route.get('/list/district', ListDistricts)

var { ListBirthStars } = require('../controller/admin/birthStars')
route.get('/list/birth-stars', ListBirthStars)

var { ListEducation } = require('../controller/admin/education')
route.get('/list/education', ListEducation)

var { ListCareer } = require('../controller/admin/career')
route.get('/list/career', ListCareer)

var { VerifyProfile } = require('../controller/user/verifyProfile')
route.put('/request/verify-profile', verifyToken, VerifyProfile)

module.exports = route
