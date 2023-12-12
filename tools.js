const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

//! 加密與解密 -----------------------------

/**
 * 隨機鹽值
 * @param {}
 * @returns  {string} 鹽值
 */
function generateSalt() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * 對密碼進行雜湊並加上鹽值
 * @param { string } password 密碼
 * @param { string } salt 鹽值
 * @returns  {string} 加鹽雜湊值
 */
function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return hash;
}

//! 小工具 -----------------------------

/**
 * 有效正整數檢查器
 * @param {} ...values 任意值
 * @returns  {boolean}
 */
function checkIsTrueNumber(...values) {
  // 檢查每個值是否為正整數
  const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

  // 檢查每個值是否為數字
  const isNumeric = (value) => !isNaN(value);

  // 檢查每個值是否滿足條件
  const isValid = (value) => isNumeric(value) && isPositiveInteger(value);

  // 返回是否所有值都滿足條件
  return values.every(isValid);
}

/**
 * 有效浮點數檢查器
 * @param {number} value 任意值
 * @returns  {boolean}
 */
function isValidPositiveNumber(value) {
  // 使用正規表達式檢查是否為正值數，允許小數點至第二位
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(value);
}

/**
 * 時光機 把時間調整顯示２４Ｈ
 * @param {data} inputDateTime -時間
 * @returns  {DateTime} 年月日時分秒(24Hour)
 */
function formatDateTime(inputDateTime) {
  const inputDate = new Date(inputDateTime);

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');
  const hours = String(inputDate.getHours()).padStart(2, '0');
  const minutes = String(inputDate.getMinutes()).padStart(2, '0');
  const seconds = String(inputDate.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//! 小工具 -----------------------------

/**
 * 伺服器端路徑常數
 */
const serverPath = '/image/';

/**
 * 上傳圖片並創建資料夾
 * @param {object} file 檔案本體
 * @param {string} fileName 檔案名稱
 * @returns  {string} 存儲路徑
 */
async function handleUploadImages(file, fileName) {
  try {
    // 伺服器端靜態資源資料夾路徑
    const staticFolderPath = path.join(__dirname, 'public', 'image'); // 使用__dirname以確保路徑正確

    // 檢查目標資料夾是否存在，如果不存在，則創建它
    await fs.mkdir(staticFolderPath, { recursive: true });
    console.log('靜態資源資料夾創建成功');

    const relativePath = path.join(serverPath, `${fileName}.png`);
    const absolutePath = path.join(staticFolderPath, `${fileName}.png`);

    console.log('準備寫入檔案，路徑：', absolutePath);
    await fs.writeFile(absolutePath, file.buffer);
    console.log('檔案寫入成功');

    console.log('檔案上傳成功');
    return relativePath;
  } catch (error) {
    console.error('檔案上傳失敗:', error);
    return false;
  }
}

module.exports = {
  formatDateTime,
  generateSalt,
  hashPassword,
  handleUploadImages,
  isValidPositiveNumber,
  checkIsTrueNumber,
};
