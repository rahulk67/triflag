
const express = require('express');
const accountController = require('../controllers/accountController');
const homeController = require('../controllers/homeController');
const winGoController= require('../controllers/winGoController');
const userController = require('../controllers/userController');
const middlewareController = require('../controllers/middlewareController');
const adminController = require('../controllers/adminController');
const dailyController = require('../controllers/dailyController');
const k5Controller = require('../controllers/k5Controller');
const k3Controller = require('../controllers/k3Controller');
const paymentController = require("../controllers/paymentController")
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let router = express.Router();

function ensureUploadsDirectory() {
  const uploadPath = path.join('uploads/');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // Creates the directory if it doesn't exist
  }
}


const qrStorage = multer.diskStorage({
   destination: function (req, file, cb) {
    ensureUploadsDirectory();
     cb(null, 'uploads/'); 
   },
   filename: function (req, file, cb) {
     const filename = 'qrImg.png'; 
     const filepath = path.join('uploads/', filename);
 
     if (fs.existsSync(filepath)) {
       fs.unlinkSync(filepath); 
     }
 
     cb(null, filename);
   }
 });

 const usdt_qrstorage = multer.diskStorage({
   destination: function (req, file, cb) {
    ensureUploadsDirectory();
     cb(null, 'uploads/'); 
   },
   filename: function (req, file, cb) {
     const filename = 'usdtImg.png'; 
     const filepath = path.join('uploads/', filename);
 
     if (fs.existsSync(filepath)) {
       fs.unlinkSync(filepath); 
     }
 
     cb(null, filename);
   }
 });
 

const uploadQr = multer({ storage: qrStorage });
const usdtUploadQr = multer({ storage: usdt_qrstorage });

const initWebRouter = app => {

   //QR
   router.post('/admin/manager/settings/QR', uploadQr.single('QR'), (req, res) => {
      if (!req.file) {
          return res.json({ status: false, message: 'No file uploaded' });
      }
  
      // File upload was successful
      res.json({ status: true, message: 'File uploaded successfully' });
  });

  router.post('/admin/manager/settings/USDTQR', usdtUploadQr.single('USDTQR'), (req, res) => {
   if (!req.file) {
       return res.json({ status: false, message: 'No file uploaded' });
   }

   // File upload was successful
   res.json({ status: true, message: 'File uploaded successfully' });
});
  
router.post('/admin/manager/settings/increaseWallet',adminController.middlewareAdminController,adminController.increaseWallet);

   // page account
   router.get("/keFuMenu", accountController.keFuMenu)
   router.get("/login", accountController.loginPage)
   router.get("/register", accountController.registerPage)
   router.get("/forgot", accountController.forgotPage)
   router.post("/api/sent/otp/verify", accountController.verifyCode)
   router.post("/api/sent/otp/verify/reset", accountController.verifyCodePass)
   router.post("/api/resetPasword", accountController.forGotPassword)

   // page home
   router.get("/", (req, res) => {
      return res.redirect("/home")
   })
   router.get("/home", homeController.homePage)
   router.get("/promotion",homeController.promotionPage)
   router.get("/checkIn/reward",middlewareController,homeController.attendance);

   router.get("/checkIn", middlewareController, homeController.checkInPage)
   router.get("/checkDes", middlewareController, homeController.checkDes)
   router.get("/checkRecord", middlewareController, homeController.checkRecord)
   router.get("/wallet/transfer", middlewareController, homeController.transfer)

   router.get("/promotion", middlewareController, homeController.promotionPage)
   router.get("/promotion/myTeam", middlewareController, homeController.promotionmyTeamPage)
   router.get("/promotion/promotionDes", middlewareController, homeController.promotionDesPage)
   router.get("/promotion/tutorial", middlewareController, homeController.tutorialPage)
   router.get("/promotion/bonusrecord", middlewareController, homeController.bonusRecordPage);
   router.get("/promotion/partnerReward", middlewareController, homeController.partnerRewardPage);
   router.get("/promotion/commissionDetails", middlewareController, homeController.comissionDetailsPage);
   router.get("/promotion/invitationRules",middlewareController,homeController.invitationRules);
   router.get("/promotion/commissionDetails",middlewareController,homeController.commisionDetailsPage);
   router.get("/promotion/rebateRatio",middlewareController,homeController.rebateRatio);
   router.get("/promotion/commissionRecord",middlewareController,userController.comissionRecord);
   router.get("/promotion/partnerRecord",middlewareController,homeController.partnerRecord);
   router.get("/promotion/partnerData",middlewareController,userController.partnerData)


   router.get("/wallet", middlewareController, homeController.walletPage)
   router.get("/wallet/recharge", middlewareController, homeController.rechargePage)
   router.get("/wallet/withdrawal", middlewareController, homeController.withdrawalPage)
   router.get("/wallet/rechargerecord", middlewareController, homeController.rechargerecordPage)
   router.get("/wallet/withdrawalrecord", middlewareController, homeController.withdrawalrecordPage)
   router.get("/wallet/addBank", middlewareController, homeController.addBank)

   router.get("/wallet/paynow/manual_upi", middlewareController, paymentController.initiateManualUPIPayment)
   router.get("/wallet/paynow/manual_usdt", middlewareController, paymentController.initiateManualUSDTPayment)
   router.post("/wallet/paynow/manual_upi_request", middlewareController, paymentController.addManualUPIPaymentRequest)
   router.post("/wallet/paynow/manual_usdt_request", middlewareController, paymentController.addManualUSDTPaymentRequest)
   router.post("/wallet/paynow/wowpay", middlewareController, paymentController.initiateWowPayPayment)
   router.post("/wallet/verify/wowpay", middlewareController, paymentController.verifyWowPayPayment)
   router.get("/wallet/verify/wowpay", middlewareController, paymentController.verifyWowPayPayment)
   router.post("/wallet/paynow/upi", middlewareController, paymentController.initiateUPIPayment)
   router.get("/wallet/verify/upi", middlewareController, paymentController.verifyUPIPayment)

   router.get("/mian", middlewareController, homeController.mianPage)

   router.get("/recordsalary", middlewareController, homeController.recordsalary)
   router.get("/getrecord", middlewareController, homeController.getSalaryRecord)
   router.get("/about", middlewareController, homeController.aboutPage)
   router.get("/redenvelopes", middlewareController, homeController.redenvelopes)
   router.get("/mian/forgot", middlewareController, homeController.forgot)
   router.get("/newtutorial", homeController.newtutorial)
   router.get("/about/Confidentiality", middlewareController, homeController.Confidentiality)
   router.get("/about/riskAgreement", middlewareController, homeController.riskAgreement)
   router.get("/tutorial",middlewareController,homeController.tutorialPage)
   router.get("/notification",middlewareController,homeController.notificationPage)
   router.get("/myProfile", middlewareController, homeController.myProfilePage)

   // BET wingo
   router.get("/win", middlewareController, winGoController.winGoPage)
   router.get("/win/3", middlewareController, winGoController.winGoPage3)
   router.get("/win/5", middlewareController, winGoController.winGoPage5)
   router.get("/win/10", middlewareController, winGoController.winGoPage10)

   // BET K5D
   router.get("/5d", middlewareController, k5Controller.K5DPage)
   router.post("/api/webapi/action/5d/join", middlewareController, k5Controller.betK5D) // register
   router.post("/api/webapi/5d/GetNoaverageEmerdList", middlewareController, k5Controller.listOrderOld) // register
   router.post("/api/webapi/5d/GetMyEmerdList", middlewareController, k5Controller.GetMyEmerdList) // register

   // BET K3
   router.get("/k3", middlewareController, k3Controller.K3Page)

   router.post("/api/webapi/action/k3/join", middlewareController, k3Controller.betK3) // register
   router.post("/api/webapi/k3/GetNoaverageEmerdList", middlewareController, k3Controller.listOrderOld) // register
   router.post("/api/webapi/k3/GetMyEmerdList", middlewareController, k3Controller.GetMyEmerdList) // register

   // login | register
   router.post("/api/webapi/login", accountController.login) // login
   router.post("/api/webapi/register", accountController.register) // register
  //  router.get("/aviator", middlewareController, userController.aviator)
   router.get("/api/webapi/GetUserInfo", middlewareController, userController.userInfo) // get info account
   router.put("/api/webapi/change/userInfo", middlewareController, userController.changeUser) // get info account
   router.put("/api/webapi/change/pass", middlewareController, userController.changePassword) // get info account

   // bet wingo
   router.post("/api/webapi/action/join", middlewareController, winGoController.betWinGo) // register
   router.post("/api/webapi/GetNoaverageEmerdList", middlewareController, winGoController.listOrderOld) // register
   router.post("/api/webapi/GetMyEmerdList", middlewareController, winGoController.GetMyEmerdList) // register

   // promotion
   router.post("/api/webapi/promotion", middlewareController, userController.promotion) // register
   router.post("/api/webapi/checkIn", middlewareController, userController.checkInHandling)
   router.get("/api/webapi/checkIn", middlewareController, userController.checkInData)
   router.get("/api/webapi/checkIn/record", middlewareController, userController.checkInRecord)
   
   router.post("/api/webapi/check/Info", middlewareController, userController.infoUserBank) // register
   router.post("/api/webapi/addBank", middlewareController, userController.addBank) // register
   router.post("/api/webapi/otp", middlewareController, userController.verifyCode) // register
   router.post("/api/webapi/use/redenvelope", middlewareController, userController.useRedenvelope) // register
   router.post("/api/webapi/addUpi", middlewareController, userController.addUpi)

   // wallet
   router.post("/api/webapi/recharge", middlewareController, userController.recharge)
   router.post("/api/webapi/cancel_recharge", middlewareController, userController.cancelRecharge) // register
   router.post("/wowpay/create", middlewareController, userController.wowpay)
   router.post("/api/webapi/confirm_recharge", middlewareController, userController.confirmRecharge)
   router.get("/api/webapi/myTeam", middlewareController, userController.listMyTeam) // register
   router.get("/api/webapi/recharge/list", middlewareController, userController.listRecharge) // register
   router.get("/api/webapi/withdraw/list", middlewareController, userController.listWithdraw) // register
   router.post("/api/webapi/recharge/check", middlewareController, userController.recharge2) // register
   router.post("/api/webapi/withdrawal", middlewareController, userController.withdrawal3) // register
   router.post("/api/webapi/callback_bank", middlewareController, userController.callback_bank) // register
   router.post("/api/webapi/recharge/update", middlewareController, userController.updateRecharge) // update recharge
   router.post("/api/webapi/transfer", middlewareController, userController.transfer) // register
   router.get("/api/webapi/transfer_history", middlewareController, userController.transferHistory) //
   router.get("/api/webapi/confirm_recharge_usdt", middlewareController, userController.confirmUSDTRecharge) //
   router.post("/api/webapi/confirm_recharge_usdt", middlewareController, userController.confirmUSDTRecharge) //

   router.post("/api/webapi/search", middlewareController, userController.search) // register

   // daily
   router.get("/manager/index", dailyController.middlewareDailyController, dailyController.dailyPage)
   router.get("/manager/listRecharge", dailyController.middlewareDailyController, dailyController.listRecharge)
   router.get("/manager/listWithdraw", dailyController.middlewareDailyController, dailyController.listWithdraw)
   router.get("/manager/members", dailyController.middlewareDailyController, dailyController.listMeber)
   router.get("/manager/profileMember", dailyController.middlewareDailyController, dailyController.profileMember)
   router.get("/manager/settings", dailyController.middlewareDailyController, dailyController.settingPage)
   router.get("/manager/gifts", dailyController.middlewareDailyController, dailyController.giftPage)
   router.get("/manager/support", dailyController.middlewareDailyController, dailyController.support)
   router.get("/manager/member/info/:phone", dailyController.middlewareDailyController, dailyController.pageInfo)

   router.post("/manager/member/info/:phone", dailyController.middlewareDailyController, dailyController.userInfo)
   router.post("/manager/member/listRecharge/:phone", dailyController.middlewareDailyController, dailyController.listRechargeMem)
   router.post("/manager/member/listWithdraw/:phone", dailyController.middlewareDailyController, dailyController.listWithdrawMem)
   router.post("/manager/member/redenvelope/:phone", dailyController.middlewareDailyController, dailyController.listRedenvelope)
   router.post("/manager/member/bet/:phone", dailyController.middlewareDailyController, dailyController.listBet)

   router.post("/manager/settings/list", dailyController.middlewareDailyController, dailyController.settings)
   router.post("/manager/createBonus", dailyController.middlewareDailyController, dailyController.createBonus)
   router.post("/manager/listRedenvelops", dailyController.middlewareDailyController, dailyController.listRedenvelops)

   router.post("/manager/listRecharge", dailyController.middlewareDailyController, dailyController.listRechargeP)
   router.post("/manager/listWithdraw", dailyController.middlewareDailyController, dailyController.listWithdrawP)

   router.post("/api/webapi/statistical", dailyController.middlewareDailyController, dailyController.statistical)
   router.post("/manager/infoCtv", dailyController.middlewareDailyController, dailyController.infoCtv) // get info account
   router.post("/manager/infoCtv/select", dailyController.middlewareDailyController, dailyController.infoCtv2) // get info account
   router.post("/api/webapi/manager/listMember", dailyController.middlewareDailyController, dailyController.listMember) // get info account

   router.post("/api/webapi/manager/buff", dailyController.middlewareDailyController, dailyController.buffMoney) // get info account

   // admin
   router.get("/admin/manager/index", adminController.middlewareAdminController, adminController.adminPage) // get info account
   router.get("/admin/manager/index/3", adminController.middlewareAdminController, adminController.adminPage3) // get info account
   router.get("/admin/manager/index/5", adminController.middlewareAdminController, adminController.adminPage5) // get info account
   router.get("/admin/manager/index/10", adminController.middlewareAdminController, adminController.adminPage10) // get info account

   router.get("/admin/manager/5d", adminController.middlewareAdminController, adminController.adminPage5d) // get info account
   router.get("/admin/manager/k3", adminController.middlewareAdminController, adminController.adminPageK3) // get info account
   router.get("/admin/manager/aviator", adminController.middlewareAdminController, adminController.adminPageAviator)

   router.get("/admin/manager/members", adminController.middlewareAdminController, adminController.membersPage) // get info account
   router.get("/admin/manager/createBonus", adminController.middlewareAdminController, adminController.giftPage) // get info account
   router.get("/admin/manager/ctv", adminController.middlewareAdminController, adminController.ctvPage) // get info account
   router.get("/admin/manager/ctv/profile/:phone", adminController.middlewareAdminController, adminController.ctvProfilePage) // get info account

   router.get("/admin/manager/settings", adminController.middlewareAdminController, adminController.settings) // get info account
   router.post("/admin/manager/settings/notification",adminController.middlewareAdminController,adminController.addNotification)
   router.get("/admin/manager/listRedenvelops", adminController.middlewareAdminController, adminController.listRedenvelops) // get info account
   router.post("/admin/manager/infoCtv", adminController.middlewareAdminController, adminController.infoCtv) // get info account
   router.post("/admin/manager/infoCtv/select", adminController.middlewareAdminController, adminController.infoCtv2) // get info account
   router.post("/admin/manager/settings/bank", adminController.middlewareAdminController, adminController.settingBank) // get info account
   router.post("/admin/manager/settings/cskh", adminController.middlewareAdminController, adminController.settingCskh) // get info account
   router.post("/admin/manager/settings/buff", adminController.middlewareAdminController, adminController.settingbuff) // get info account
   router.post("/admin/manager/create/ctv", adminController.middlewareAdminController, adminController.register) // get info account
   router.post("/admin/manager/create/partner", adminController.middlewareAdminController, adminController.registerPartner) 
   router.post("/admin/manager/settings/get", adminController.middlewareAdminController, adminController.settingGet) // get info account
   router.post("/admin/manager/createBonus", adminController.middlewareAdminController, adminController.createBonus) // get info account

   router.post("/admin/member/listRecharge/:phone", adminController.middlewareAdminController, adminController.listRechargeMem)
   router.post("/admin/member/listWithdraw/:phone", adminController.middlewareAdminController, adminController.listWithdrawMem)
   router.post("/admin/member/redenvelope/:phone", adminController.middlewareAdminController, adminController.listRedenvelope)
   router.post("/admin/member/bet/:phone", adminController.middlewareAdminController, adminController.listBet)
   router.post("/admin/member/aviatorBet/:phone", adminController.middlewareAdminController, adminController.listBetAviator)

   router.get("/admin/manager/recharge", adminController.middlewareAdminController, adminController.rechargePage) // get info account
   router.get("/admin/manager/withdraw", adminController.middlewareAdminController, adminController.withdraw) // get info account
   // router.get('/admin/manager/level', adminController.middlewareAdminController, adminController.level); // get info account
   router.get("/admin/manager/levelSetting", adminController.middlewareAdminController, adminController.levelSetting)
   router.get("/admin/manager/CreatedSalaryRecord", adminController.middlewareAdminController, adminController.CreatedSalaryRecord)
   router.get("/admin/manager/rechargeRecord", adminController.middlewareAdminController, adminController.rechargeRecord) // get info account
   router.get("/admin/manager/withdrawRecord", adminController.middlewareAdminController, adminController.withdrawRecord) // get info account
   router.get("/admin/manager/statistical", adminController.middlewareAdminController, adminController.statistical) // get info account
   router.get("/admin/member/info/:id", adminController.middlewareAdminController, adminController.infoMember)
   router.get("/api/webapi/admin/getLevelInfo", adminController.middlewareAdminController, adminController.getLevelInfo)
   router.get("/api/webapi/admin/getSalary", adminController.middlewareAdminController, adminController.getSalary)

   router.get('/admin/manager/settings/getpool',adminController.middlewareAdminController,adminController.getPool);

   router.post('/admin/manager/settings/updatePool',adminController.middlewareAdminController,adminController.updatePool)

   router.post('/admin/aviatorResult',adminController.middlewareAdminController,adminController.aviatorResult);
   router.get('/admin/bulkSMS',adminController.middlewareAdminController,adminController.bulkSmsPage);
   router.post('/admin/filterData',adminController.middlewareAdminController,adminController.filteredUser);

   router.post("/api/webapi/admin/updateLevel", adminController.middlewareAdminController, adminController.updateLevel) // get info account
   router.post("/api/webapi/admin/CreatedSalary", adminController.middlewareAdminController, adminController.CreatedSalary) // get info account
   router.post("/api/webapi/admin/listMember", adminController.middlewareAdminController, adminController.listMember) // get info account
   router.post("/api/webapi/admin/listctv", adminController.middlewareAdminController, adminController.listCTV) // get info account
   router.post("/api/webapi/admin/withdraw", adminController.middlewareAdminController, adminController.handlWithdraw) // get info account
   router.post("/api/webapi/admin/recharge", adminController.middlewareAdminController, adminController.recharge) // get info account
   router.post("/api/webapi/admin/rechargeDuyet", adminController.middlewareAdminController, adminController.rechargeDuyet) // get info account
   router.post("/api/webapi/admin/member/info", adminController.middlewareAdminController, adminController.userInfo) // get info account
   router.post("/api/webapi/admin/statistical", adminController.middlewareAdminController, adminController.statistical2) // get info account

   router.post("/api/webapi/admin/banned", adminController.middlewareAdminController, adminController.banned) // get info account

   router.post("/api/webapi/admin/totalJoin", adminController.middlewareAdminController, adminController.totalJoin) // get info account
   router.post("/api/webapi/admin/change", adminController.middlewareAdminController, adminController.changeAdmin) // get info account
   router.post("/api/webapi/admin/profileUser", adminController.middlewareAdminController, adminController.profileUser) // get info account

   // admin 5d
   router.post("/api/webapi/admin/5d/listOrders", adminController.middlewareAdminController, adminController.listOrderOld) // get info account
   router.post("/api/webapi/admin/k3/listOrders", adminController.middlewareAdminController, adminController.listOrderOldK3) // get info account
   router.post("/api/webapi/admin/5d/editResult", adminController.middlewareAdminController, adminController.editResult) // get info account
   router.post("/api/webapi/admin/k3/editResult", adminController.middlewareAdminController, adminController.editResult2) // get info account

   // game stats
   router.get("/api/webapi/admin/wingo/money_stats", adminController.middlewareAdminController, adminController.getWingoBatingAmountOfOptions) // get info account
   router.get("/api/webapi/admin/k3/money_stats", adminController.middlewareAdminController, adminController.getK3BatingAmountOfOptions) // get info account
   router.get("/api/webapi/admin/5d/money_stats", adminController.middlewareAdminController, adminController.get5dBatingAmountOfOptions) // get info account

   //activity

   router.get("/activity/home",middlewareController,homeController.getActivityPage);
   router.get("/activity/records",middlewareController,userController.activityRecords);
   router.get("/activity/recordPage",middlewareController,homeController.activityRecords)
   router.post("/activity/claim",middlewareController,userController.weeklyClaim);
   router.get("/activity/invitationBonus",middlewareController,homeController.invitationRewardPage)
   router.post('/invitationReward/claim',middlewareController,homeController.invitationRewardClaim);
   router.get("/activity/invitationBonusRules",middlewareController,homeController.invitationRewardRules)


   router.use('/aviator',middlewareController,homeController.gamePage);





   return app.use("/", router)
}

module.exports = {
   initWebRouter,
}
