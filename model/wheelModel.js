const { pool } = require('../db/db');
const tools = require('../tools');

/**
 *取得所有獎品
 * @param {number} desirePpage -目標頁
 * @param {number} desiredQuantity -欲顯示筆數
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise < {
 * AllPrize: Array<[
 * prizeId: number,
 * prizeProbability: number,
 * quantity: number,
 * prizeName: string,
 * img:imgPath ,
 * ]
 * desirePpage :number,
 * totalPage: number,
 * totalRows: number,
 * }} 所有存在架上的獎品資訊，包含當前頁數、單頁筆數及總比數
 */
async function readAllPrize(desirePpage, desiredQuantity) {
  try {
    let selectPrize = `SELECT
    id AS prizeId,
    FORMAT(probability, 2) AS prizeProbability,
    quantity ,
    name AS prizeName,
    img 
    FROM prize
    WHERE status = 1
    `;

    // 如果是分頁模式加入新的段落  LIMIT 和 OFFSET
    if (desiredQuantity && desirePpage !== undefined) {
      // 起始行
      const startRow = (desirePpage - 1) * desiredQuantity;

      // 總行數
      const countQuery =
        'SELECT COUNT(*) as totalRows FROM prize WHERE status = 1';
      const [countResult] = await pool.query(countQuery);
      const totalRows = countResult[0].totalRows;
      // 總頁數
      const totalPage = Math.ceil(countResult[0].totalRows / desiredQuantity);

      selectPrize += ` LIMIT ? OFFSET ?`;
      const [AllPrize] = await pool.query(selectPrize, [
        desiredQuantity,
        startRow,
      ]);

      return { AllPrize, desirePpage, totalPage, totalRows };
    }

    // 完全讀取模式
    const [AllPrize] = await pool.query(selectPrize);
    return AllPrize;
  } catch (error) {
    console.error('獲取獎品 data 時發生錯誤:', error);
    throw new Error('獲取獎品 data 時發生錯誤');
  }
}

/**
 * 新增獎品
 * @param {string} name 獎品名
 * @param {number} quantity 獲獎數量
 * @param {number} probability 設定機率，小數點第二位
 * @param {path} imgPath 儲存獎品圖片路徑
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 */

async function createPrize(name, quantity, probability, imgPath) {
  try {
    const newPrize = `
            insert into prize (name, quantity, probability, img) 
            values (?,?,?,?)`;
    const prizeValue = [name, quantity, probability, imgPath];
    const result = await pool.query(newPrize, prizeValue);
    console.log(`\u001b[33m`, '執行新增獎品Data', `\u001b[37m`);
    return result[0].affectedRows > 0;
  } catch (error) {
    console.error('新增獎品data時發生錯誤:', error);
    throw new Error('新增獎品data時發生錯誤');
  }
}

/**
 * "軟"刪除獎品
 * @param {number} prizeId 獎品Id
 * @param {number} n 異動狀態 (1 = true ,0 = false)
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 */
async function removePrize(prizeId, n) {
  try {
    const selectPrize = `
    UPDATE prize SET status = ? WHERE id = ? AND status = 1
    `;
    const [result] = await pool.query(selectPrize, [n, prizeId]);
    console.log(`\u001b[33m`, `執行${prizeId}顯示狀態更新`, `\u001b[37m`);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('刪除獎品data時發生錯誤:', error);
    throw new Error('刪除獎品data時發生錯誤');
  }
}

/**
 * 編輯獎品
 * @param {number} prizeId 獎品Id
 * @param {string} name 品名
 * @param {number} quantity 數量
 * @param {number} probability 機率，小數點第二位
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 */
async function editPrize(prizeId, name, quantity, probability) {
  try {
    const selectPrize = `
    UPDATE prize SET name = ? ,quantity=? ,probability=? WHERE id = ? AND status = 1
    `;
    const [result] = await pool.query(selectPrize, [
      name,
      quantity,
      probability,
      prizeId,
    ]);

    console.log(`\u001b[33m`, `執行${prizeId}內容更新`, `\u001b[37m`);
    console.log(
      `\u001b[33m`,
      `內容更新品名：${name}，數量：${quantity}，機率：${probability}%`,
      `\u001b[37m`
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('編輯獎品data時發生錯誤:', error);
    throw new Error('編輯獎品data時發生錯誤');
  }
}

/**
 * 加入抽獎紀錄
 * @param {number} playerId 玩家Id
 * @param {string} prizeName 玩家姓名
 * @param {number} prizeQuantity 中獎物數量
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 */
async function creatLotteryRecord(playerId, prizeName, prizeQuantity) {
  try {
    const newLotteryRecord = `
            insert into lottery_log (player_id,prize_name,prize_quantity) 
            values (?,?,?)`;
    const recordValue = [playerId, prizeName, prizeQuantity];
    const result = await pool.query(newLotteryRecord, recordValue);
    console.log(`\u001b[33m`, '執行抽獎Data紀錄', `\u001b[37m`);
    return result[0].affectedRows > 0;
  } catch (error) {
    console.error('新增抽獎Data紀錄時發生錯誤:', error);
    throw new Error('新增抽獎Data紀錄時發生錯誤');
  }
}

/**
 * 分頁讀取抽獎紀錄（全玩家或指定 phoneNumber)
 * @param {string} phoneNumber -玩家電話
 * @param {number} desirePpage -目標頁
 * @param {number} desiredQuantity -欲顯示筆數
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise< {
 * playerLotteryRecord: Array <[
 * phoneNumber:string,
 * playerName:string,
 * prizeName:string,
 * quantity:number,
 * lotteryTime:string
 * ]>
 * desiredPage: number,
 * totalPage: number,
 * totalRow: number}}
 **/

async function readAllPlayerLotteryRecord(
  phoneNumber,
  desirePpage,
  desiredQuantity
) {
  try {
    // 起始行
    const startRow = (desirePpage - 1) * desiredQuantity;

    // 總行數
    let countQuery;
    let countParams;

    if (phoneNumber) {
      countQuery = `SELECT COUNT(*) as totalRows
        FROM lottery_log
        JOIN player ON lottery_log.player_id = player.id
        WHERE player.phone_number = ?`;

      countParams = [phoneNumber];
    } else {
      countQuery = 'SELECT COUNT(*) as totalRows FROM lottery_log';
      countParams = [];
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalRows = countResult[0].totalRows;
    // 總頁數
    const totalPage = Math.ceil(totalRows / desiredQuantity);

    // 查詢抽獎紀錄
    let selectLotteryRecord;
    let selectParams;
    if (phoneNumber) {
      selectLotteryRecord = `
        SELECT
          player.phone_number AS phoneNumber,
          player.name AS playerName,
          lottery_log.prize_name AS prizeName,
          lottery_log.prize_quantity AS quantity,
          lottery_log.create_time AS lotteryTime
        FROM
          lottery_log
        JOIN
          player ON lottery_log.player_id = player.id
        WHERE
          player.phone_number = ?
        ORDER BY lottery_log.create_time DESC 
        LIMIT ? OFFSET ?;
        `;
      selectParams = [phoneNumber, desiredQuantity, startRow];
    } else {
      selectLotteryRecord = `
          SELECT
          player.phone_number AS phoneNumber,
          player.name AS playerName,
          lottery_log.prize_name AS prizeName,
          lottery_log.prize_quantity AS quantity,
          lottery_log.create_time AS lotteryTime
        FROM
          lottery_log
        JOIN
          player ON lottery_log.player_id = player.id
          ORDER BY lottery_log.create_time DESC
          LIMIT ? OFFSET ?
          `;
      selectParams = [desiredQuantity, startRow];
    }

    const [getRecord] = await pool.query(selectLotteryRecord, selectParams);

    const playerLotteryRecord = getRecord.map((row) => ({
      phoneNumber: row.phoneNumber,
      playerName: row.playerName,
      prizeName: row.prizeName,
      quantity: row.quantity,
      lotteryTime: tools.formatDateTime(row.lotteryTime),
    }));

    return { playerLotteryRecord, desirePpage, totalPage, totalRows };
  } catch (error) {
    console.error('讀所有玩家抽獎紀錄Data紀錄時發生錯誤:', error);
    throw new Error('讀所有玩家抽獎紀錄Data紀錄時發生錯誤');
  }
}

/**
 * 獲取指定ID玩家抽獎紀錄
 * @param {number} userId -玩家Id
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise< Array <[
 * prizeName:string,
 * quantity:number,
 * lotteryTime:string
 * ]>>} 單一玩家抽獎紀錄內容
 **/

async function readPlayerLotteryRecord(playerId) {
  try {
    const selectLotteryRecord = `SELECT
    prize_name AS prizeName,
    prize_quantity As quantity ,
    create_time AS lotteryTime
    FROM lottery_log
    WHERE player_id = ?
    ORDER BY create_time DESC
    `;
    const [getRecord] = await pool.query(selectLotteryRecord, [playerId]);
    if (getRecord.length == 0) {
      return false;
    }
    const playerLotteryRecord = await getRecord.map((row) => ({
      prizeName: row.prizeName,
      quantity: row.quantity,
      lotteryTime: tools.formatDateTime(row.lotteryTime),
    }));
    return playerLotteryRecord;
  } catch (error) {
    console.error('讀取指定玩家抽獎紀錄Data紀錄時發生錯誤:', error);
    throw new Error('讀取指定玩家抽獎紀錄Data紀錄時發生錯誤');
  }
}

module.exports = {
  createPrize,
  readAllPrize,
  creatLotteryRecord,
  removePrize,
  readAllPlayerLotteryRecord,
  readPlayerLotteryRecord,
  editPrize,
};
