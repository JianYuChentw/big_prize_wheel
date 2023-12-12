const adminModel = require('../model/adminModel');

/**
 * 取得當前管理者帳號
 */
async function getadminData(req, res) {
  /**
   * 中介層賦予權利
   * @param {number} adminId 管理者Id，來自身份驗證中介層的設定。
   */
  const adminId = req.admin;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    const adminAccoumt = await adminModel.getAdminAccount(adminId);
    return res.status(200).json({ status: true, admin: adminAccoumt });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 管理者登入
 */
async function adminLogin(req, res) {
  /**
   * 來自請求req.body的帳號及密碼。
   * @typedef {Object} adminLoginData
   * @property {string} account - 管理者帳號
   * @property {string} password - 管理者密碼
   */
  /** @type {adminLoginData} */

  const { account, password } = req.body;
  const roleTag = 'admin';
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };

  try {
    const chekAdminResult = await adminModel.checkIsAdmin(account, password);
    if (!chekAdminResult) {
      ErrorResponseResult = {
        loginStatus: false,
        message: '管理員登入失敗,帳號或密碼有誤有誤！',
      };
      throw new Error('管理員登入失敗,帳號或密碼有誤有誤！');
    }

    ///給與權限動作
    req.session[roleTag] = chekAdminResult;

    console.log(`\u001b[33m`, `${account}管理員登入成功`, `\u001b[37m`);
    return res.json({
      loginStatus: true,
      adminName: account,
      message: '管理員登入成功',
    });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

/**
 * 管理者登出
 */
async function adminLogOut(req, res) {
  /**
   * 中介層賦予權利
   * @param {number} adminId 管理者Id，來自身份驗證中介層的設定。
   */
  const adminId = req.admin;
  let ErrorResponseResult = { status: false, message: '伺服器錯誤' };
  try {
    if (adminId === null) {
      ErrorResponseResult = { loginStatus: false, message: '尚無登入狀態' };
      throw new Error('尚無登入狀態');
    }
    delete req.session.admin;
    return res.status(200).json({ loginStatus: true, message: '管理員登出' });
  } catch (error) {
    console.error('失敗:', error);
    return res.status(500).json(ErrorResponseResult);
  }
}

module.exports = {
  adminLogin,
  adminLogOut,
  getadminData,
};
