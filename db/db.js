const mysql = require('mysql2/promise');

// 資料庫連線資料
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 測試資料庫連線
async function testConnection() {
  try {
    // 獲取資料庫連線，使用 pool.getConnection()
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.query('SELECT * FROM player LIMIT 1');
    // 釋放資料庫連線
    conn.release();
    console.log('成功連線到資料庫');
  } catch (error) {
    console.error('無法連線到資料庫:', error);
    console.error(error.stack);
  }
}

// 呼叫測試資料庫連線函式
testConnection();

module.exports = {
  pool,
};
