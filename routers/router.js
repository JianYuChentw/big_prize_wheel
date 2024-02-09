const express = require('express');
const router = express.Router();
const multer = require('multer');
const playerCtrl = require('../controller/playerCtrl');
const adminCtrl = require('../controller/adminCtrl');
const wheelCtrl = require('../controller/wheelCtrl');
const roleGuard = require('../middlewares/role-guard');
const upload = multer();

//玩家登入
router.post('/player/login', playerCtrl.login);

//玩家註冊
router.post('/player/new', playerCtrl.register);

//玩家中獎紀錄
router.get(
  '/player/lottery-record',
  roleGuard('player'),
  wheelCtrl.getSpecifiedPlayerIdLotteryRecord
);

//玩家基本資訊
router.get('/player', roleGuard('player'), playerCtrl.getPlayerData);

//抽獎功能
router.get('/player/go-lottery', roleGuard('player'), wheelCtrl.goLottery);

//獎品頁
router.get('/player/prize-list', roleGuard('player'), wheelCtrl.getAllPrizes);

//! 管理員區 --------------------------------

//中介層(管理員)
function canAdminUseFunctionMiddleware(req, res, next) {
  const adminId = req.session.adminId;
  if (adminId === undefined) {
    return res.json({ loginStatus: false, message: '非管理員登入狀態' });
  }
  req.adminId = adminId;
  next();
}

//管理員登入
router.post('/admin/login', adminCtrl.adminLogin);

router.get('/admin', roleGuard('admin'), adminCtrl.getadminData);

//管理員登出
router.put('/admin/logOut', roleGuard('admin'), adminCtrl.adminLogOut);

//所有玩家資訊總覽 GET /players/lottery-record?page=1&pageSize=10
router.get(
  '/admin/all-players',
  roleGuard('admin'),
  playerCtrl.getAllPlayerData
);

//獲取玩指定家資訊(phoneNumber)
router.get(
  '/admin/players',
  roleGuard('admin'),
  playerCtrl.searchPhoneNumberGetPlayerData
);

//異動玩家票卷數
router.put(
  '/admin/ticket-quantity',
  roleGuard('admin'),
  playerCtrl.updateLotteryTicket
);

//獲取玩家中獎紀錄
router.get(
  '/admin/players-lottery-record',
  roleGuard('admin'),
  wheelCtrl.getAllLotteryRecord
);

//獲取玩指定家中獎紀錄
router.get(
  '/admin/player-lottery-record',
  roleGuard('admin'),
  wheelCtrl.getSpecifiedPhoneNumberLotteryRecord
);

//獎品頁(中台分頁模式)
router.get(
  '/admin/prize-list/pagination',
  roleGuard('admin'),
  wheelCtrl.getAllPrizesHavePagination
);

//新增獎品
router.post(
  '/admin/prize/new',
  roleGuard('admin'),
  upload.single('file'),
  wheelCtrl.addPrize
);

//刪除獎品
router.put('/admin/prize/delete', roleGuard('admin'), wheelCtrl.deletePrize);

//編輯獎品
// router.put('/prize/edit', canAdminUseFunctionMiddleware);

module.exports = router;
