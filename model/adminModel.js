const { pool } = require('../db/db');
const tools = require('../tools');

/**
 * 新增管理員 (無對外使用)
 * @param {string} account 設定帳號
 * @param {string} password 設定密碼
 * @returns {boolean} true
 **/

async function createAdmin(account, password) {
  try {
    const salt = tools.generateSalt();
    const newUser = `
            insert into admin (account,password,salt) 
            values (?,?,?)`;

    const userValue = [account, tools.hashPassword(password, salt), salt];
    const result = await pool.query(newUser, userValue);
    console.log('新增admin成功!');
    return result.affectedRows > 0;
  } catch (error) {
    console.error('新增失敗admin時發生錯誤:', error);
    throw new Error('新增失敗admin時發生錯誤');
  }
}

// createAdmin('admin123', '12345678');

/**
 * 驗證帳號密碼
 * @param {string} account 帳號
 * @param {string} password 帳號
 * @returns {boolean}
 **/

async function checkIsAdmin(account, password) {
  try {
    // 檢查帳號是否存在
    const adminQuery = `
    SELECT * FROM admin
    WHERE account = ?
  `;
    const [adminResults] = await pool.query(adminQuery, account);

    if (adminResults.length === 0) {
      console.error('帳號不存在');
      return false;
    }

    const adminData = adminResults[0];
    const hash = tools.hashPassword(password, adminData.salt);
    if (hash !== adminData.password) {
      console.error('密碼不正確');
      return false;
    }
    console.log('登入成功');
    //刷新最後登錄時間
    const UpdateadminLoginTime = `UPDATE admin SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?`;
    await pool.query(UpdateadminLoginTime, adminData.id);
    return adminData.id;
  } catch (error) {
    console.error('登入失敗', error);
    return false;
  }
}

/**
 * 取得管理者帳號
 * @param {Number} id
 * @returns {string} 獲得管理者帳號
 */

async function getAdminAccount(id) {
  try {
    const selectAdmin = `SELECT account FROM admin WHERE id = ?`;
    const [result] = await pool.query(selectAdmin, [id]);

    if (result.length > 0) {
      // 如果有符合條件的資料，返回該管理者的帳號
      return result[0].account;
    } else {
      // 如果沒有符合條件的資料，返回 null 或適合的預設值
      return null;
    }
  } catch (error) {
    console.error('獲取管理者帳號時發生錯誤:', error);
    throw new Error('獲取管理者帳號時發生錯誤');
  }
}

module.exports = {
  checkIsAdmin,
  getAdminAccount,
};
