/**
 * 權限驗證
 * @param {string} role 指名參數
 * @returns 指定回傳型態(目前沒有所以為空)
 */

function roleGuard(role) {
  return (req, res, next) => {
    const checkId = req.session[role];
    if (checkId === undefined) {
      const errMsg = role === 'admin' ? '非管理員登入狀態' : '非玩家登入狀態';
      return res.json({ loginStatus: false, error: errMsg });
    }

    req[role] = checkId;
    next();
  };
}

module.exports = roleGuard;
