const { json } = require('express');
const playerModel = require('../model/playerModel');
const tools = require('../tools');
const { checkIsAdmin } = require('../model/adminModel');

/**
 * 登入
 */

async function login(req, res) {
  /**
   * 來自請求req.body的電話號碼。
   * @type {string} phoneNumber
   */
  const phoneNumber = req.body.phoneNumber;
  const roleTag = 'player';
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    //格式確認
    if (
      phoneNumber.length < 10 ||
      phoneNumber.length > 10 ||
      !phoneNumber.match(/^\d+$/)
    ) {
      ErrorResponseResult = { loginStatus: false, message: '*不符合輸入格式' };
      throw new Error('不符合輸入格式');
    }

    //電話確認會員資格
    const chekMemberResult = await playerModel.checkHasPhoneNumber(phoneNumber);
    if (!chekMemberResult) {
      ErrorResponseResult = {
        loginStatus: false,
        message: '*登入失敗,電話號碼有誤！',
      };
      throw new Error('登入失敗,電話號碼有誤！');
    }

    ///給與權限動作
    req.session[roleTag] = chekMemberResult.id;
    console.log(`\u001b[33m`, `${chekMemberResult.name}登入成功`, `\u001b[37m`);
    return res.status(200).json({
      loginStatus: true,
      message: '登入成功',
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 註冊
 */
async function register(req, res) {
  /**
   * 來自請求req.body的姓名及電話號碼。
   * @typedef {Object} PlayerRegisterData
   * @property {string} playerName - 玩家姓名
   * @property {string} phoneNumber - 玩家電話
   */
  /** @type {PlayerRegisterData} */

  const { playerName, phoneNumber } = req.body;
  let ErrorResponseResult = { status: false, message: '*伺服器錯誤' };
  try {
    //格式確認
    if (
      phoneNumber.length < 10 ||
      phoneNumber.length > 10 ||
      playerName.length > 6 ||
      !/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(playerName)
    ) {
      ErrorResponseResult = { status: false, message: '*不符合輸入格式' };
      throw new Error('不符合輸入格式');
    }

    // 重複電話確認
    const isUserRepeat = await playerModel.checkHasPhoneNumber(phoneNumber);
    if (isUserRepeat) {
      ErrorResponseResult = { status: false, message: '*電話號碼已存在' };
      throw new Error('電話號碼');
    }

    //新增玩家
    const haveCreateUser = await playerModel.createPlayer(
      playerName,
      phoneNumber
    );
    if (!haveCreateUser) {
      ErrorResponseResult = { status: false, message: '*註冊失敗' };
      throw new Error('註冊失敗');
    }
    console.log(`\u001b[33m`, `${playerName}註冊成功`, `\u001b[37m`);
    return res.status(200).json({ status: true, message: '註冊成功' });
  } catch (error) {
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 以playerId取得玩家個人資料
 */
async function getPlayerData(req, res) {
  /**
   * 中介層賦予權利
   * @param {number} playerId 玩家Id，來自身份驗證中介層的設定。
   */

  const playerId = req.player;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    const hasPlayerData = await playerModel.getplayerFromId(playerId);
    if (!hasPlayerData) {
      ErrorResponseResult = { status: false, message: '無使用者資料' };
      throw new Error('獲取玩家資料發生錯誤');
    }
    console.log(
      `\u001b[33m`,
      `取得${hasPlayerData.playerName}的玩家個人資料`,
      `\u001b[37m`
    );
    return res.status(200).json({ status: true, playerData: hasPlayerData });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 取得所有玩家資料
 */
async function getAllPlayerData(req, res) {
  /**
   * 來自請求 req.body 的玩家分頁資料。
   * @typedef {Object} PlayerData
   * @property {number} desirePpage - 目標頁。
   * @property {number} desiredQuantity - 單頁筆數。
   */

  /** @type {PlayerData} */
  const { desirePpage, desiredQuantity } = req.query;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  // 轉換為整數
  const page = parseInt(desirePpage);
  const quantity = parseInt(desiredQuantity);
  try {
    // 檢查是否為有效的正整數
    if (!tools.checkIsTrueNumber(page, quantity)) {
      ErrorResponseResult = {
        status: false,
        message: '請確認輸入目標頁是否為正整數',
      };
      throw new Error('請確認輸入目標頁是否為正整數');
    }

    const playerData = await playerModel.getAllPlayers(page, quantity);

    //頁數與數量判定
    if (playerData.timeConversion.length == 0) {
      ErrorResponseResult = {
        status: true,
        playerData: null,
        message: '請重新確認目標頁數與數量',
      };
      throw new Error('請重新確認目標頁數與數量');
    }
    console.log(`\u001b[33m`, `取得所有玩家個人資料`, `\u001b[37m`);

    return res.status(200).json({
      status: true,
      playerData: playerData.timeConversion,
      nowPage: playerData.desiredPage,
      totalPage: playerData.totalPage,
      totalPlayer: playerData.totalRows,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 以phoneNumber取得玩家資料
 */
async function searchPhoneNumberGetPlayerData(req, res) {
  /**
   * 來自請求req.query的電話號碼。
   * @type {string} phoneNumber
   */
  const phoneNumber = req.query.phoneNumber;
  let ErrorResponseResult = { status: false, message: '*伺服器錯誤' };

  try {
    // 電話格式確認
    if (
      phoneNumber.length < 10 ||
      phoneNumber.length > 10 ||
      !phoneNumber.match(/^\d+$/)
    ) {
      ErrorResponseResult = { status: false, message: '*不符合輸入格式' };
      throw new Error('不符合輸入格式');
    }
    const playerData = await playerModel.getPlayerByPhoneNumber(phoneNumber);
    if (!playerData) {
      ErrorResponseResult = { status: false, message: '*無相符對象' };
      throw new Error('無相符對象');
    }
    console.log(`\u001b[33m`, `取得${phoneNumber}的玩家個人資料`, `\u001b[37m`);
    return res.status(200).json({
      status: true,
      playerData: playerData,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 更新玩家票卷數
 */
async function updateLotteryTicket(req, res) {
  /**
   * 來自請求 req.body 的玩家 Id 及更新票卷數。
   * @typedef {Object} PlayerUpdateData
   * @property {number} id - 玩家 Id。
   * @property {number} newQuantity - 更新的票卷數量。
   */

  /** @type {PlayerUpdateData} */

  const { id, newQuantity } = req.body;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    // 檢查是否為有效的正整數

    if (
      !tools.checkIsTrueNumber(id) ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 0 ||
      typeof newQuantity == 'string'
    ) {
      ErrorResponseResult = {
        status: false,
        message: '請確認輸入目標是否為有效數字',
      };
      throw new Error('請確認輸入目標是否為有效數字');
    }

    if (!tools.checkIsTrueNumber(id)) {
      ErrorResponseResult = {
        status: false,
        message: '請確認輸入目標頁是否為正整數',
      };
      throw new Error('請確認輸入目標頁是否為正整數');
    }

    // 檢查玩家存在
    checkIsPlayer = await playerModel.getplayerFromId(id);
    if (!checkIsPlayer) {
      ErrorResponseResult = {
        status: false,
        message: '請確認玩家是否存在',
      };
      throw new Error('請確認玩家是否存在');
    }

    //執行更新
    await playerModel.updatePlayerTicket(id, newQuantity);
    console.log(
      `\u001b[33m`,
      `更新玩家:${id}，票卷數量為${newQuantity}成功`,
      `\u001b[37m`
    );
    return res.status(200).json({
      status: true,
      message: '更新成功',
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

module.exports = {
  login,
  register,
  getPlayerData,
  getAllPlayerData,
  updateLotteryTicket,
  searchPhoneNumberGetPlayerData,
};
