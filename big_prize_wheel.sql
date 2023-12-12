create database `big_prize_wheel`;
use `big_prize_wheel`;
show tables;

SELECT * FROM `player`;
SELECT * FROM `admin`;
SELECT * FROM `prize`;
SELECT * FROM `lottery_log`;


create table `player` (
`id` int auto_increment primary key comment '使用者ＩＤ',  
`phone_number` VARCHAR(10) NOT NULL UNIQUE comment '手機號碼 唯一性約束UNIQUE',
`name` varchar(6) NOT NULL  comment '玩家暱稱',  
`lottery_tickets` int default 0 comment '持有票卷', 
`create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP comment '玩家創建時間', 
`last_lottery_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP comment '最後抽獎時間'
);

create table `admin` (
`id` int auto_increment primary key comment '管理者ＩＤ', 
`account` varchar(16) NOT NULL comment '帳號', 
`password` varchar(100) NOT NULL comment '密碼', 
`salt` varchar(100) NOT NULL comment '鹽值', 
`status` int default 0 comment '登入狀態', 
`create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP comment '創建時間',
`last_login_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP comment '最後登入時間'
);

CREATE TABLE `prize` (
  `id` INT AUTO_INCREMENT PRIMARY KEY comment '獎品ＩＤ',
  `name` VARCHAR(6) NOT NULL comment '品名',
  `quantity` INT DEFAULT 0 comment '數量',
  `probability` DECIMAL(5,2) NOT NULL comment '中獎機率',
  `img` VARCHAR(255) NOT NULL comment '存儲圖片路徑的欄位',
  `status` INT DEFAULT 1 comment '獎品狀態',
  `last_update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP comment '最後更新時間'
);


CREATE TABLE `lottery_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY comment '抽獎紀錄ＩＤ',
  `player_id` INT comment '玩家ID',
  `prize_name` VARCHAR(6) comment '品名',
  `prize_quantity` INT DEFAULT 0 comment '數量',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP comment '抽獎創建時間',
  FOREIGN KEY (player_id) REFERENCES player (id) ON DELETE CASCADE ON UPDATE CASCADE);
