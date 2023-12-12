const wheelModel = require('../model/wheelModel');
const playerMode = require('../model/playerModel');
const wheelSever = require('../services/wheelSever');
const tools = require('../tools');
const fs = require('fs');
const { log } = require('console');
/**
 * @description 快取獎品區，每次抽獎或異動時會對他做讀取或操作
 * @type {object} prizeBox -獎品箱
 */
let prizeBox = null;

/**
 * 幸運輪大抽獎
 */
async function goLottery(req, res) {
  /**
   * 中介層賦予權利
   * @param {number} playerId 玩家Id，來自身份驗證中介層的設定。
   */
  const playerId = req.player;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  let currentPrizeBox = null;
  try {
    // 確認抽獎卷數
    const players = await playerMode.getplayerFromId(playerId);
    if (players.ticketsQuantity < 1) {
      ErrorResponseResult = {
        status: false,
        message: '你沒有抽獎卷摟QQ',
      };
      throw new Error('抽獎失敗，請確認抽獎卷數');
    }

    //快取
    if (prizeBox === null) {
      currentPrizeBox = await wheelModel.readAllPrize();
      prizeBox = currentPrizeBox;
    } else {
      currentPrizeBox = prizeBox;
    }
    if (currentPrizeBox.length == 0) {
      ErrorResponseResult = {
        status: false,
        message: '目前沒有獎品給你抽QQ',
      };
      throw new Error('抽獎失敗，抽獎箱當前無內容');
    }
    // 執行抽獎
    const prize = wheelSever.lotteryDraw(currentPrizeBox);
    // 更新抽獎時間
    await playerMode.updatePlayerLotteryTime(playerId);

    //新增抽獎紀錄

    const prizeName = prize ? prize.name : null;
    const prizeQuantity = prize ? prize.quantity : 0;

    const checkHasCreatLotteryRecord = await wheelModel.creatLotteryRecord(
      playerId,
      prizeName,
      prizeQuantity
    );

    if (!checkHasCreatLotteryRecord) {
      ErrorResponseResult = { status: false, message: '新增紀錄失敗' };
      throw new Error('新增紀錄失敗');
    }
    await playerMode.updatePlayerTicket(playerId, players.ticketsQuantity - 1);

    return res.status(200).json({
      status: true,
      prize: prize,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 獎品箱
 */
async function getAllPrizes(req, res) {
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    //快取
    if (prizeBox === null) {
      const havePrize = await wheelModel.readAllPrize();
      if (havePrize.length === 0) {
        console.log(`\u001b[33m`, `當前獎品箱數量為0`, `\u001b[37m`);
        prizeBox == null;
      }
      prizeBox = havePrize;
    }
    console.log(
      `\u001b[33m`,
      `當前獎品箱數量為${prizeBox.length}`,
      `\u001b[37m`
    );
    return res.status(200).json({
      status: true,
      prize: prizeBox,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 有分頁功能的獎品箱
 */
async function getAllPrizesHavePagination(req, res) {
  /**
   * 來自請求 req.body 的獎品箱分頁資料。
   * @typedef {Object} PrizesData
   * @property {number} desirePpage - 目標頁。
   * @property {number} desiredQuantity - 單頁筆數。
   */

  /** @type {PrizesData} */
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

    //快取
    if (prizeBox === null) {
      const havePrize = await wheelModel.readAllPrize();
      prizeBox = havePrize;
    }

    const prize = await wheelModel.readAllPrize(page, quantity);
    prizeBox = await wheelModel.readAllPrize();

    //頁數與數量判定
    if (prize.AllPrize.length == 0) {
      ErrorResponseResult = {
        status: true,
        prize: null,
        totalProbability: 0,
        message: '請重新確認目標頁數與數量',
      };
      throw new Error('請重新確認目標頁數與數量');
    }

    const totalProbability = prizeBox.reduce(
      (total, prize) => total + parseFloat(prize.prizeProbability),
      0
    );

    return res.status(200).json({
      status: true,
      totalProbability: totalProbability.toFixed(2),
      prize: prize.AllPrize,
      nowPpage: prize.desirePpage,
      totalPage: prize.totalPage,
      totalPrizes: prize.totalRows,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 新增獎品
 */
async function addPrize(req, res) {
  /**
   * 來自請求 req.body 的獎品箱基本資料。
   * @typedef {Object} PrizesData
   * @property {string} prizeName - 獎品名
   * @property {img} files -圖片檔案
   * @property {number} quantity - 中獎獲得數量。
   * @property {number} prizeProbability - 設定中獎機率。
   */

  /** @type {PrizesData} */
  const { prizeName, quantity, prizeProbability } = req.body;
  /**
   * @type {object} files -獎品圖片
   */
  const files = req.file;

  // 將內容轉型
  const quantityToNumber = parseInt(quantity);
  const prizeProbabilityToNumber = parseFloat(prizeProbability);

  let ErrorResponseResult = { status: false, message: '*伺服器錯誤' };

  try {
    if (!files) {
      ErrorResponseResult = {
        status: false,
        message: '*請重新確認是否已上傳圖片',
      };
      throw new Error('檔案有誤重新再確認');
    }
    if (files.mimetype != 'image/png') {
      ErrorResponseResult = {
        status: false,
        message: '*檔案格式錯誤，圖片僅接受png檔',
      };
      throw new Error('檔案格式錯誤，僅接受png圖片檔');
    }
    if (files.size > 2000000) {
      ErrorResponseResult = { status: false, message: '*檔案超過上限 2MB' };
      throw new Error('檔案超過上限 2MB');
    }
    // 檢查是否為有效參數

    if (
      !tools.checkIsTrueNumber(quantityToNumber) ||
      !tools.isValidPositiveNumber(prizeProbabilityToNumber) ||
      prizeName.length === 0 ||
      prizeName.length > 6 ||
      !/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(prizeName)
    ) {
      ErrorResponseResult = {
        status: false,
        message: '*請確認獎品名稱是否為有效內容，或正確格式',
      };
      throw new Error('請確認輸入參數是否為有效內容，或正確格式');
    }

    //快取
    if (prizeBox === null) {
      prizeBox = await wheelModel.readAllPrize();
    }

    //重複獎品名
    const newPrizeNameIsRepeat = prizeBox.some(
      (item) => item.prizeName === prizeName
    );

    if (newPrizeNameIsRepeat) {
      ErrorResponseResult = {
        status: false,
        message: '*已存在相同品名獎品',
      };
      throw new Error('已存在相同品名獎品');
    }

    // 判定機率餘數
    let nowProbability = wheelSever.ProbabilitySum(prizeBox);
    if (nowProbability + prizeProbabilityToNumber > 100) {
      ErrorResponseResult = {
        status: false,
        message: `*超過機率上限，當前機率僅容許${(100 - nowProbability).toFixed(
          2
        )}%`,
      };
      throw new Error(
        `超過機率上限，剩餘機率容許${(100 - nowProbability).toFixed(2)}%`
      );
    }

    //! 要插入圖片判定 ---------------

    const imgPath = await tools.handleUploadImages(files, prizeName);

    if (!imgPath) {
      ErrorResponseResult = {
        status: false,
        message: '*圖片上傳發生錯誤',
      };
      throw new Error('圖片上傳發生錯誤');
    }

    // 加入獎箱
    const canAddPrize = await wheelModel.createPrize(
      prizeName,
      quantityToNumber,
      prizeProbabilityToNumber,
      imgPath
    );
    if (!canAddPrize) {
      ErrorResponseResult = {
        status: false,
        message: `*確認新增獎品輸入內容，是否有誤`,
      };
      throw new Error(`確認新增獎品輸入內容，是否有誤`);
    }

    // 更新快取
    prizeBox = await wheelModel.readAllPrize();
    console.log(
      `\u001b[33m`,
      `獎品新增成功，品名:${prizeName}、數量:${quantityToNumber}、預設機率:${prizeProbabilityToNumber}%，機率總和為：${
        nowProbability + prizeProbabilityToNumber
      }%`,
      `\u001b[37m`
    );
    return res.status(200).json({
      status: true,
      message: `新增獎品成功`,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 刪除獎品
 */
async function deletePrize(req, res) {
  /**
   * @type {number} prizeId -獎品id
   */
  const prizeId = parseInt(req.query.id);
  let ErrorResponseResult = { status: false, message: '*伺服器錯誤' };
  try {
    //改變獎品存活狀態
    const isDeletePrize = await wheelModel.removePrize(prizeId, 0);

    if (!isDeletePrize) {
      ErrorResponseResult = { status: false, message: '*請確認獎品是否存在' };
      throw new Error('請確認獎品是否存在');
    }
    console.log(`\u001b[33m`, `已將獎品${prizeId}下架`, `\u001b[37m`);
    //刷新獎品箱
    prizeBox = await wheelModel.readAllPrize();
    return res.status(200).json({
      status: true,
      message: '刪除獎品成功',
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 獲取指定playerId玩家抽獎紀錄
 */
async function getSpecifiedPlayerIdLotteryRecord(req, res) {
  /**
   * 中介層賦予權利
   * @param {number} playerId 玩家Id，來自身份驗證中介層的設定。
   */
  const playerId = req.player;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    const lotteryRecord = await wheelModel.readPlayerLotteryRecord(playerId);
    if (!lotteryRecord) {
      ErrorResponseResult = { status: false, message: '無抽獎紀錄' };
      throw new Error('無抽獎紀錄');
    }
    return res.status(200).json({
      status: true,
      lotteryRecord: lotteryRecord,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 獲取指定phoneNumber玩家抽獎紀錄
 */
async function getSpecifiedPhoneNumberLotteryRecord(req, res) {
  /**
   * 指定電話號碼玩家的抽獎紀錄有分頁
   * @typedef {object} PhoneNumberLotteryRecord
   * @property {string} phoneNumber - 玩家電話號碼。
   * @property {number} desirePpage - 目標頁。
   * @property {number} desiredQuantity - 單頁筆數。
   */
  /**@type {PhoneNumberLotteryRecord} */
  const { phoneNumber, desirePpage, desiredQuantity } = req.query;
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
    // 電話格式確認
    if (phoneNumber.length < 10 || phoneNumber.length > 10) {
      ErrorResponseResult = { Status: false, message: '不符合輸入格式' };
      throw new Error('不符合輸入格式');
    }

    const lotteryRecord = await wheelModel.readAllPlayerLotteryRecord(
      phoneNumber,
      page,
      quantity
    );
    //頁數與數量判定
    if (lotteryRecord.playerLotteryRecord.length == 0) {
      ErrorResponseResult = {
        status: true,
        allLotteryRecord: null,
        message: '無相應資料，或尚無抽獎紀錄',
      };
      throw new Error('無相應資料，或尚無抽獎紀錄');
    }

    return res.status(200).json({
      status: true,
      allLotteryRecord: lotteryRecord.playerLotteryRecord,
      nowPpage: lotteryRecord.desirePpage,
      totalPage: lotteryRecord.totalPage,
      totalRecord: lotteryRecord.totalRows,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 獲取全部玩家抽獎紀錄
 */
async function getAllLotteryRecord(req, res) {
  /**
   * 來自請求 req.body 的玩家分頁資料。
   * @typedef {Object} PlayerLotteryRecord
   * @property {number} desirePpage - 目標頁。
   * @property {number} desiredQuantity - 單頁筆數。
   */

  /** @type {PlayerLotteryRecord} */
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

    const lotteryRecord = await wheelModel.readAllPlayerLotteryRecord(
      '',
      page,
      quantity
    );
    //頁數與數量判定
    if (lotteryRecord.playerLotteryRecord.length == 0) {
      ErrorResponseResult = {
        status: true,
        allLotteryRecord: null,
        message: '請重新確認目標頁數與數量，或尚無匹配內容',
      };
      throw new Error('請重新確認目標頁數與數量，或尚無匹配內容');
    }

    return res.status(200).json({
      status: true,
      allLotteryRecord: lotteryRecord.playerLotteryRecord,
      nowPpage: lotteryRecord.desirePpage,
      totalPage: lotteryRecord.totalPage,
      totalRecord: lotteryRecord.totalRows,
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

module.exports = {
  goLottery,
  getAllPrizes,
  addPrize,
  deletePrize,
  getAllPrizesHavePagination,
  getSpecifiedPlayerIdLotteryRecord,
  getAllLotteryRecord,
  getSpecifiedPhoneNumberLotteryRecord,
};
