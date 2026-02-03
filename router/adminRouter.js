var express = require("express");
var route = express.Router();
var { AdminverifyToken, Adminauthorize, } = require('../middleware/authMiddleware')
var { checkPermission } = require('../middleware/checkPermission')

var { AdminLogin } = require('../controller/admin/login')
route.post('/login', AdminLogin)

var { LogOut } = require('../controller/user/login')
route.post('/logout', AdminverifyToken, LogOut)

var { CreatePlan, ListAllPlans, EditPlan, DeletePlan } = require('../controller/admin/plans')
route.post('/add/plan', AdminverifyToken, Adminauthorize('admin'), checkPermission('add_plan'), CreatePlan)

route.post('/list/plans', AdminverifyToken, ListAllPlans)
route.post('/edit/plan', AdminverifyToken, Adminauthorize('admin'), checkPermission('edit_plan'), EditPlan)
route.delete('/delete/plan', AdminverifyToken, Adminauthorize('admin'), checkPermission('delete_plan'), DeletePlan)

var { ListAllUsers, UpdateUserStatus } = require('../controller/admin/users')
route.post('/list/users', AdminverifyToken, ListAllUsers)
route.post('/change/users-status', AdminverifyToken, Adminauthorize('admin'), checkPermission('change_user_status'), UpdateUserStatus)

var { AddCommunity, AddReligion, ListCommunity, Listreligion, EditCommunity, EditReligion, DeleteCommunity, DeleteReligion } = require('../controller/admin/religionCommunity')
route.post('/add/religion', AdminverifyToken, Adminauthorize('admin'), AddReligion)
route.post('/add/community', AdminverifyToken, Adminauthorize('admin'), AddCommunity)
route.get('/list/religion', AdminverifyToken, Listreligion)
route.get('/list/community', AdminverifyToken, ListCommunity)
route.post('/edit/religion', AdminverifyToken, Adminauthorize('admin'), EditReligion)
route.post('/edit/community', AdminverifyToken, Adminauthorize('admin'), EditCommunity)
route.delete('/delete/religion', AdminverifyToken, Adminauthorize('admin'), DeleteReligion)
route.delete('/delete/community', AdminverifyToken, Adminauthorize('admin'), DeleteCommunity)

var { CreateAddOnPlan, ListAddOnPlans, DeleteAddOnPlan, EditAddOnPlan } = require('../controller/admin/addOnplan')
route.post('/add/add_on_plan', AdminverifyToken, Adminauthorize('admin'), checkPermission('create_add_on_plan'), CreateAddOnPlan)
route.post('/list/add_on_plans', AdminverifyToken, ListAddOnPlans)
route.post('/edit/add_on_plan', AdminverifyToken, Adminauthorize('admin'), EditAddOnPlan)
route.post('/delete/add_on_plan', AdminverifyToken, Adminauthorize('admin'), DeleteAddOnPlan)

var { PaymentHistory } = require('../controller/user/payment')
route.get('/payment/history', AdminverifyToken, Adminauthorize('admin'), PaymentHistory)

var { AddHabit, ListHabit, EditHabit, DeleteHabit } = require('../controller/admin/habit')
route.post('/add/habit', AdminverifyToken, Adminauthorize('admin'), AddHabit)
route.get('/list/habit', AdminverifyToken, ListHabit)
route.post('/edit/habit', AdminverifyToken, Adminauthorize('admin'), EditHabit)
route.delete('/delete/habit', AdminverifyToken, Adminauthorize('admin'), DeleteHabit)

var { AddHobbies, ListHobbies, EditHobbies, DeleteHobbies } = require('../controller/admin/hobbies')
route.post('/add/hobbies', AdminverifyToken, Adminauthorize('admin'), AddHobbies)
route.get('/list/hobbies', AdminverifyToken, ListHobbies)
route.post('/edit/hobbies', AdminverifyToken, Adminauthorize('admin'), EditHobbies)
route.delete('/delete/hobbies', AdminverifyToken, Adminauthorize('admin'), DeleteHobbies)

var { AddProfileTags, ListProfileTags, EditProfileTags, DeleteProfileTags } = require('../controller/admin/profileTags')
route.post('/add/profile-tags', AdminverifyToken, Adminauthorize('admin'), AddProfileTags)
route.get('/list/profile-tags', AdminverifyToken, ListProfileTags)
route.post('/edit/profile-tags', AdminverifyToken, Adminauthorize('admin'), EditProfileTags)
route.delete('/delete/profile-tags', AdminverifyToken, Adminauthorize('admin'), DeleteProfileTags)

var { Dashboard } = require('../controller/admin/dashboard')
route.post('/dashboard', AdminverifyToken, Adminauthorize('admin'), Dashboard)

var { SalesOverview } = require('../controller/admin/sales')
route.post('/salesoverview', AdminverifyToken, Adminauthorize('admin'), SalesOverview)

var { CreatePermission, ListPermissions, EditPermission, DeletePermission } = require('../controller/admin/permisionlist')
// route.post('/add/permission', AdminverifyToken, Adminauthorize('admin'), CreatePermission)
route.get('/list/permission', AdminverifyToken, ListPermissions)
// route.post('/edit/permission', AdminverifyToken, Adminauthorize('admin'), EditPermission)
// route.post('/delete/permission', AdminverifyToken, Adminauthorize('admin'), DeletePermission) 

var { AddAdmin, ListAdmin, EditAdmin, DeleteAdmin } = require('../controller/admin/addAdmins')
route.post('/add/admin', AdminverifyToken, Adminauthorize('admin'), checkPermission('add_admin'), AddAdmin)
route.get('/list/admin', AdminverifyToken, Adminauthorize('admin'), ListAdmin)
route.post('/edit/admin', AdminverifyToken, Adminauthorize('admin'), checkPermission('edit_admin'), EditAdmin)
route.delete('/delete/admin', AdminverifyToken, Adminauthorize('admin'), checkPermission('delete_admin'), DeleteAdmin)

var { forgotpassword, VerifyOtp, ResetPassword } = require('../controller/admin/forgetpassword')
route.post('/forgotpassword', forgotpassword)
route.post('/verify-otp', VerifyOtp)
route.post('/change-password', ResetPassword)

var { AddTermsAndPolicy, ListTermsAndPolicy } = require('../controller/admin/termsAndPolicty')
route.post('/add/term-policy', AdminverifyToken, AddTermsAndPolicy)
route.get('/list/term-policy', ListTermsAndPolicy)

var { AddLanguage, ListLanguage, DeleteLanguage, EditLanguage } = require('../controller/admin/language')
route.post('/add/language', AdminverifyToken, AddLanguage)
route.get('/list/language', AdminverifyToken, ListLanguage)
route.delete('/delete/language', AdminverifyToken, DeleteLanguage)
route.put('/edit/language', AdminverifyToken, EditLanguage)

var { ListBlockedUser } = require('../controller/user/interest')
route.post('/list/blocked-users', AdminverifyToken, Adminauthorize('admin'), ListBlockedUser)

var { AddFaq, ListFaq, DeleteFaq, EditFaq } = require('../controller/admin/faq')
route.post('/add/faq', AdminverifyToken, AddFaq)
route.get('/list/faq', AdminverifyToken, ListFaq)
route.delete('/delete/faq', AdminverifyToken, DeleteFaq)
route.put('/edit/faq', AdminverifyToken, EditFaq)

var { AddCountry, ListCountry, EditCountry, DeleteCountry } = require('../controller/admin/locations')
route.post('/add/country', AdminverifyToken, AddCountry)
route.get('/list/country', AdminverifyToken, ListCountry)
route.put('/edit/country', AdminverifyToken, EditCountry)
route.delete('/delete/country', AdminverifyToken, DeleteCountry)

var { AddState, ListStates, EditStates, DeleteStates } = require('../controller/admin/locations')
route.post('/add/states', AdminverifyToken, AddState)
route.get('/list/states', AdminverifyToken, ListStates)
route.put('/edit/states', AdminverifyToken, EditStates)
route.delete('/delete/states', AdminverifyToken, DeleteStates)

var { AddDistrict, ListDistricts, EditDitricts, DeleteDistricts } = require('../controller/admin/locations')
route.post('/add/districts', AdminverifyToken, AddDistrict)
route.get('/list/districts', AdminverifyToken, ListDistricts)
route.put('/edit/districts', AdminverifyToken, EditDitricts)
route.delete('/delete/districts', AdminverifyToken, DeleteDistricts)

var { AddBirthStars, ListBirthStars, EditBirthStars, DeleteBirthStars } = require('../controller/admin/birthStars')
route.post('/add/birth-stars', AdminverifyToken, AddBirthStars)
route.get('/list/birth-stars', AdminverifyToken, ListBirthStars)
route.put('/edit/birth-stars', AdminverifyToken, EditBirthStars)
route.delete('/delete/birth-stars', AdminverifyToken, DeleteBirthStars)

var { AddEducation, ListEducation, EditEducation, DeleteEducation } = require('../controller/admin/education')
route.post('/add/education', AdminverifyToken, AddEducation)
route.get('/list/education', AdminverifyToken, ListEducation)
route.put('/edit/education', AdminverifyToken, EditEducation)
route.delete('/delete/education', AdminverifyToken, DeleteEducation)

var { AddCareer, ListCareer, EditCareer, DeleteCareer } = require('../controller/admin/career')
route.post('/add/career', AdminverifyToken, AddCareer)
route.get('/list/career', AdminverifyToken, ListCareer)
route.put('/edit/career', AdminverifyToken, EditCareer)
route.delete('/delete/career', AdminverifyToken, DeleteCareer)

var { ApproveVerification } = require('../controller/user/verifyProfile')
route.put('/approve/verify-profile', AdminverifyToken, ApproveVerification)

module.exports = route
