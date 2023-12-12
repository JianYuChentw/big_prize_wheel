const { pool } = require('../db/db');
const tools = require('../tools');

/**
 * 新增玩家
 * @param {string} playerName -設定玩家姓名
 * @param {string} phoneNumber -設定玩家電話
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 **/

async function createPlayer(playerName, phoneNumber) {
  try {
    const newUser = `
          insert into player (name,phone_number)
          values (?,?)`;

    const userValue = [playerName, phoneNumber];
    const result = await pool.query(newUser, userValue);
    console.log(`\u001b[33m`, '執行玩家Data新增', `\u001b[37m`);
    return result[0].affectedRows > 0;
  } catch (error) {
    console.error('新增data時發生錯誤:', error);
    throw new Error('新增data時發生錯誤');
  }
}

/**
 * 該電話號碼玩家是否存在
 * @param {string} phoneNumber -玩家電話
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 **/

async function checkHasPhoneNumber(phoneNumber) {
  try {
    const repeatResult = 'SELECT * FROM player WHERE BINARY phone_number = ?';
    const [results] = await pool.execute(repeatResult, [phoneNumber]);
    if (results.length == 0) {
      return false;
    }
    return results[0];
  } catch (error) {
    console.error('檢查data重複使用者時發生錯誤:', error);
    throw new Error('檢查data重複使用者時發生錯誤');
  }
}

/**
 * 獲取指定 phoneNumber玩家資訊
 * @param {string} phoneNumber -玩家電話
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise<{
 * playerId:number
 * playerName:string,
 * phoneNumber:string,
 * ticketsQuantity:number,
 * playerCreateTime:string,
 * lastLotteryTime:string
 * }} 包含玩家資訊的物件
 */
async function getPlayerByPhoneNumber(phoneNumber) {
  try {
    const getPlayerInfoQuery = `
      SELECT
        id as playerId,
        name as playerName,
        phone_number as phoneNumber,
        lottery_tickets as ticketsQuantity,
        create_time as playerCreateTime,
        last_lottery_time as lastLotteryTime
      FROM player
      WHERE phone_number = ?`;

    const [rows] = await pool.query(getPlayerInfoQuery, [phoneNumber]);

    if (rows.length === 0) {
      return false;
    }
    return {
      playerId: rows[0].playerId,
      playerName: rows[0].playerName,
      phoneNumber: rows[0].phoneNumber,
      ticketsQuantity: rows[0].ticketsQuantity,
      playerCreateTime: tools.formatDateTime(rows[0].playerCreateTime),
      lastLotteryTime: tools.formatDateTime(rows[0].lastLotteryTime),
    };
  } catch (error) {
    console.error('獲取玩家資料發生錯誤:', error);
    throw new Error('獲取玩家資料發生錯誤');
  }
}

/**
 * 獲取全玩家資訊
 * @param {number} desirePpage -目標頁
 * @param {number} desiredQuantity -欲顯示筆數
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise<{
 * timeConversion: Array <[
 * playerId:number
 * playerName:string,
 * phoneNumber:string,
 * ticketsQuantity:number,
 * playerCreateTime:string,
 * lastLotteryTime:string
 * ]>,
 * desiredPage: number,
 *  totalPage: number,
 *  totalRow: number }} 包含全玩家資訊的物件
 **/
async function getAllPlayers(desiredPage, desiredQuantity) {
  try {
    const startRow = (desiredPage - 1) * desiredQuantity;

    const countQuery = 'SELECT COUNT(*) as totalRows FROM player';
    const [countResult] = await pool.query(countQuery);
    const totalPage = Math.ceil(countResult[0].totalRows / desiredQuantity);

    const getAllPlayersQuery = `
      SELECT
        id as playerId,
        name as playerName,
        phone_number as phoneNumber,
        lottery_tickets as ticketsQuantity,
        create_time as playerCreateTime,
        last_lottery_time as lastLotteryTime
      FROM player 
      ORDER BY create_time DESC
      LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(getAllPlayersQuery, [
      desiredQuantity,
      startRow,
    ]);

    const timeConversion = rows.map((row) => ({
      playerId: row.playerId,
      playerName: row.playerName,
      phoneNumber: row.phoneNumber,
      ticketsQuantity: row.ticketsQuantity,
      playerCreateTime: tools.formatDateTime(row.playerCreateTime),
      lastLotteryTime: tools.formatDateTime(row.lastLotteryTime),
    }));

    return {
      timeConversion,
      desiredPage,
      totalPage,
      totalRows: countResult[0].totalRows,
    };
  } catch (error) {
    console.error('獲取所有玩家資料發生錯誤:', error);
    throw new Error('獲取所有玩家資料發生錯誤');
  }
}

/**
 * 獲取指定ID獲取玩家資訊
 * @param {number} userId -玩家Id
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {Promise<{
 * playerId:number
 * playerName:string,
 * phoneNumber:string,
 * ticketsQuantity:number,
 * playerCreateTime:string,
 * lastLotteryTime:string
 * }} 包含玩家資訊的物件
 */
async function getplayerFromId(userId) {
  try {
    const getPlayerInfoQuery = `
      SELECT
        name as playerName,
        phone_number as phoneNumber,
        lottery_tickets as ticketsQuantity,
        create_time as playerCreateTime,
        last_lottery_time as lastLotteryTime
        FROM player
        WHERE id = ?`;
    const [rows] = await pool.query(getPlayerInfoQuery, [userId]);

    if (rows.length > 0) {
      const userData = rows[0];
      console.log('取得使用者資料');
      return {
        playerName: userData.playerName,
        phoneNumber: userData.phoneNumber,
        ticketsQuantity: userData.ticketsQuantity,
        playerCreateTime: tools.formatDateTime(userData.playerCreateTime),
        lastLotteryTime: tools.formatDateTime(userData.lastLotteryTime),
      };
    } else {
      return false;
    }
  } catch (error) {
    console.error('獲取玩家資料發生錯誤', error);
    throw new Error('獲取玩家資料發生錯誤');
  }
}

/**
 * 更新玩家的抽獎時間
 * @async
 * @function
 * @param {number} playerId - 玩家的 ID
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 */
async function updatePlayerLotteryTime(playerId) {
  const updateQuery = `UPDATE player SET last_lottery_time = CURRENT_TIMESTAMP WHERE id = ?`;

  try {
    await pool.query(updateQuery, [playerId]);
    console.log('成功更新 last_lottery_time');
  } catch (error) {
    console.error('更新 last_lottery_time 時發生錯誤:', error);
    throw new Error('更新玩家抽獎時間失敗');
  }
}

/**
 * 更新玩家票卷數
 * @param {number} userId -玩家Id
 * @param {number} quantity -指定票卷數
 * @throws {Error} 如果更新操作失敗，將拋出錯誤
 * @returns {boolean}
 */
async function updatePlayerTicket(playerId, quantity) {
  try {
    const updateQuery = `UPDATE player SET lottery_tickets =?  WHERE id = ?`;
    const checkHasUpdateTicket = await pool.query(updateQuery, [
      quantity,
      playerId,
    ]);
    return checkHasUpdateTicket.affectedRows > 0;
  } catch (error) {
    console.error('更新玩家票卷數發生錯誤', error);
    throw new Error('更新玩家票卷數發生錯誤');
  }
}

module.exports = {
  createPlayer,
  checkHasPhoneNumber,
  getplayerFromId,
  updatePlayerLotteryTime,
  updatePlayerTicket,
  getPlayerByPhoneNumber,
  getAllPlayers,
};
