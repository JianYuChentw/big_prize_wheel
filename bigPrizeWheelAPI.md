# **Big Prize Wheel**
 >幸運輪大抽獎 API說明


## **玩家頁面功能**
### **登入**

>輸入電話號碼登入

- **URL**
  >/player/login

 **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "phoneNumber": "0912345678", // String
      }
    ```

- **Success Response:**
  >登入成功
  - **Code:** 200 <br />
    **Content:**
    `(登入成功，給予權限)`
    <br />
    ```json
      {
        "status":true, // Boolean
        "message": "登入成功" // String
      }
    ```

- **Error Response:**
  >登入失敗
  - **Code:** 401 <br />
    **Content:**
    `(登入失敗)`
    ```json
      {
      "status":false, // Boolean
      "message": "登入失敗,帳號或密碼有誤！" // String
      }
    ```

### **註冊**

>輸入帳號、密碼註冊為會員

- **URL**
  >/player/new

 **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "phoneNumber": "0912345678", // String
        "playerName": "YuKaiBoy" // String
      }
    ```

- **Success Response:**
  >註冊成功
  - **Code:** 200 <br />
    **Content:**
    `註冊成功)`
    <br />
    ```json
      {
        "status":true, // Boolean
        "message": "註冊成功" // String
      }
    ```

- **Error Response:**
  >註冊失敗
  - **Code:** 401 <br />
    **Content:**
    `(註冊失敗)`
    ```json
      {
        "status":false, // Boolean
        "message": "電話號碼已存在" // String
      }
    ```


### **獲取中獎紀錄**
>獲取玩家自己的獲獎紀錄

- **URL**
  >/player/lottery-record

- **Method:**

  `POST`

- **URL Params**

  `none`

-  **Required:**
  `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `中獎紀錄相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "lotteryRecord":[{
          "prizeName": "手機", // String
          "quantity": 1, //Integer
          "lotteryTime":"2023-11-13 14:44:21", //Datetime
          },{
      
          "prizeName":"香蕉", // String
          "quantity": 10, // Integer
          "lotteryTime":"2023-11-13 13:44:21", // Datetime
          },{
          "prizeName": "蘋果", // String
          "quantity": 2, // Integer
          "lotteryTime":"2023-11-13 12:44:21", //Datetime
          }], // Array  
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, //Boolean
      "message":"伺服器錯誤" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "非登入狀態" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "尚未抽獎" //String
    }
    ```



### **玩家資訊**
>玩家資訊

- **URL**
  >/player

- **Method:**

    `GET`

- **URL Params**

    `none`

-  **Required:**
    `none`
  

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `玩家相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "playerData":{
          "playerName":"歐洲人", // String
          "phoneNumber": "0912345678", // String
          "ticketsQuantity": 10, // Integer
          "playerCreatTime":"2023-11-13 14:44:21", // Datetime
          "lastLotteryTime":"2023-11-13 14:44:21", // Datetime
          },
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, // Boolean
      "message":"伺服器錯誤" // String
    }
    or
    {
      "status": false, // Boolean
      "message": "非登入狀態" // String
    }
    ```


### **抽獎功能**
>執行抽獎

- **URL**
  >/player/go-lottery

- **Method:**

  `GET`

- **URL Params**

  `none`

-  **Required:**

   `none`

- **Success Response:**
  - **Code:** 200 <br />
    **Content:**
    ```json
    {   
      "status":true, // Boolean
      "prize":{
        "prizeId": 1, // Integer
        "prizeName": "高級衛生紙", // String
        "quantity":1, // Integer
        "img":"url", // URL
      }
    }
    or

    未中獎
    {   
      "status":true, // Boolean
      "prize":null
    }
    ```
- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
      {
        "status": false, // Boolean
        "message": "非登入狀態" // String
      }
      or
      {
        "status": false, // Boolean
        "message": "抽獎失敗，請確認抽獎卷數" // String
      }
      or
      {
        "status": false, // Boolean
        "message": "抽獎機更新中，請稍後再試" // String
      }
    ```

### **獎品頁**
>獎品資料頁，包含獎品中獎機率

- **URL**
  >/player/prize-list

- **Method:**

  `GET`

- **URL Params**
  `none`
-  **Required:**

  `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `當前獎品的資訊`
   ```json
    {
      "status":true, // Boolean
      "prizeList":[{
          "prizeId":1, // Integer
          "prizeProbability":40.15, // Float
          "quantity":5, // Integer
          "prizeName":"香蕉", // String
          "img":"url", // URL
          },{
          "prizeId": 2, // Integer
          "prizeProbability": 10.25, // Float
          "quantity":1, // Integer
          "prizeName": "蘋果", // String
          "img":"url", // URL
          },{
          "prizeId": 3, // Integer
          "prizeProbability": 0.12, // Float 
          "quantity":1, // Integer,
          "prizeName": "手機", // String
          "img":"url", // URL
        }], // Array 
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, // Boolean
      "message":"伺服器錯誤" // String
    }
    or
    {
      "status": false, // Boolean
      "message": "非登入狀態" // String
    }
    ```

## **管理員頁面功能**
### **登入**

>輸入帳號、密碼

- **URL**
  >/admin/login

 **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "account": "NianYaoBro", //String
        "password": "password123" //String
      }
    ```

- **Success Response:**
  >登入成功
  - **Code:** 200 <br />
    **Content:**
    `(登入成功，給予權限)`
    <br />
    ```json
      {
        "status":true, //Boolean
        "message": "登入成功" //String
      }
    ```

- **Error Response:**
  >登入失敗
  - **Code:** 401 <br />
    **Content:**
    `(登入失敗)`
    ```json
      {
        "status":false, //Boolean
        "message": "登入失敗,帳號或密碼有誤！" //String
      }
    ```



### **玩家資訊總覽**

>所有玩家資訊

- **URL**
  >/admin/all-players?desirePpage="page"&desiredQuantity="quantity"

- **Method:**

  `GET`

- **URL Params**
  
  - `page (Integer)`: 欲查詢的頁面.
  - `quantity (Integer)`: 每頁顯示的紀錄數量.

-  **Required:**
  `none`
  

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `所有玩家相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "playerData":[{
          "playerId":1, // Integer
          "playerName":"歐洲人", // String
          "phoneNumber": "0912345678", // String
          "ticketsQuantity": 10, // Integer
          "playerCreatTime":"2023-11-13 14:44:21", // Datetime
          "lastLotteryTime":"2023-11-13 14:44:21", // Datetime
          },{
          "playerId":2, // Integer
          "playerName":"火星人", // String
          "phoneNumber": "0912349678", // String
          "ticketsQuantity": 5, // Integer
          "playerCreatTime":"2023-11-13 14:44:21", // Datetime
          "lastLotteryTime":"2023-11-13 14:44:21", // Datetime
          },{
          "playerId":3, // Integer
          "playerName":"月球人", // String
          "phoneNumber": "0912445678", // String
          "ticketsQuantity": 100, // Integer
          "playerCreatTime":"2023-11-13 14:44:21", // Datetime
          "lastLotteryTime":"2023-11-13 14:44:21", // Datetime
          }], // Array 
      "nowPage":1, //Integer    
      "totlePage":1, //Integer 
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, // Boolean
      "message":"伺服器錯誤" // String
    }
    or
    {
      "status": false, // Boolean
      "message": "非登入狀態" // String
    }
    ```

### **指定玩家資訊**

>所有玩家資訊

- **URL**
  >/admin/players?phoneNumber="phoneNumber"

- **Method:**

  `GET`

- **URL Params**

 - `phoneNumber (String)`: 玩家電話號碼.

-  **Required:**
  
  `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `所有玩家相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "playerData":{
          "playerId":1, // Integer
          "playerName":"歐洲人", // String
          "phoneNumber": "0912345678", // String
          "ticketsQuantity": 10, // Integer
          "playerCreatTime":"2023-11-13 14:44:21", // Datetime
          "lastLotteryTime":"2023-11-13 14:44:21", // Datetime
          }  
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, // Boolean
      "message":"伺服器錯誤" // String
    }
    or
    {
      "status": false, // Boolean
      "message": "非登入狀態" // String
    }
    ```


### **異動玩家票卷數量**

>異動抽獎卷數量

  **URL**
  >/admin/ticket-quantity

- **Method:**

  `PUT`

- **URL Params**
  `none`

- **Required:**
      **Body:**

    ```json
    {
      "id":1, // Integer
      "newQuantity":10 // Integer
    }
    ```

- **Success Response:**
  >新增成功
  - **Code:** 200 <br />
    **Content:**
    `(返回成功提示或失敗提示)`
    <br />
    ```json
      {
        "status":true, // Boolean
        "message":"異動抽獎卷成功" // String
      }
      
    ```

- **Error Response:**
  >發生錯誤
  - **Code:** 500 <br />
    **Content:**
    `返回錯舞提示`
    ```json
      {
        "status":false, //Boolean
        "message":"伺服器錯誤" //String
      }
      or
      {
        "status":false, //Boolean
        "message":"異動抽獎卷失敗" //String
      }
      or
      {
        "status": false, //Boolean
        "message": "非登入狀態" //String
      }
    ```

### **獲取所有玩家中獎紀錄**
>獲取所有玩家自己的獲獎紀錄

- **URL**
  >/admin/players-lottery-record?desirePpage="page"&desirePpage="quantity"

- **Method:**

    `POST`

- **URL Params**

  - `page (Integer)`: 欲查詢的頁面.
  - `quantity (Integer)`: 每頁顯示的紀錄數量.

-  **Required:**

    `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `中獎紀錄相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "allLotteryRecord":[{
          "phoneNumber": "0912345678", // String
          "playerName":"火星人", // String
          "prizeName": "手機", // String
          "quantity": 1, //Integer
          "lotteryTime":"2023-11-13 14:44:21", //Datetime
          },{
          "phoneNumber": "0912345679", // String
          "playerName":"歐洲人", // String
          "prizeName":"香蕉", // String
          "quantity": 10, // Integer
          "lotteryTime":"2023-11-13 13:44:21", // Datetime
          },{
          "phoneNumber": "0912345676", // String
          "playerName":"火星人", // String
          "prizeName": "蘋果", // String
          "quantity": 2, // Integer
          "lotteryTime":"2023-11-13 12:44:21", //Datetime
          }], // Array
      "nowPage":1, //Integer    
      "totlePage":1, //Integer
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, //Boolean
      "message":"伺服器錯誤" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "非登入狀態" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "尚未抽獎" //String
    }
    ```

### **指定玩家中獎紀錄**
>獲取所有玩家自己的獲獎紀錄

- **URL**
  >/admin/player-lottery-record?phoneNumber="phoneNumber"&desirePpage="Page"&desiredQuantity="quantity"

- **Method:**

    `POST`

- **URL Params**

  - `phoneNumber (String)`: 玩家電話號碼.
  - `Page (Integer)`: 欲查詢的頁面.
  - `quantity (Integer)`: 每頁顯示的紀錄數量.

-  **Required:**
    `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `中獎紀錄相關資訊內容`
   ```json
    {
      "status":true, // Boolean
      "allLotteryRecord":[{
          "phoneNumber": "0912345678", // String
          "playerName":"火星人", // String  
          "prizeName": "手機", // String       
          "quantity": 1, //Integer
          "lotteryTime":"2023-11-13 14:44:21", //Datetime
          },{
          "phoneNumber": "0912345678", // String
          "playerName":"火星人", // String
          "prizeName":"香蕉", // String
          "quantity": 10, // Integer
          "lotteryTime":"2023-11-13 13:44:21", // Datetime
          },{
          "phoneNumber": "0912345678", // String
          "playerName":"火星人", // String
          "prizeName": "蘋果", // String
          "quantity": 2, // Integer
          "lotteryTime":"2023-11-13 12:44:21", //Datetime
          }], // Array
      "nowPage":1, //Integer    
      "totlePage":1, //Integer
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, //Boolean
      "message":"伺服器錯誤" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "非登入狀態" //String
    }
    or
    {
      "status": false, //Boolean
      "message": "尚未抽獎" //String
    }
    ```


### **中台獎品頁**
>獎品資料頁，包含獎品中獎機率

- **URL**
  >/admin/prize-list/pagination?desirePpage="page"&desiredQuantity="quantity"

- **Method:**

  `GET`

- **URL Params**
  - `page (Integer)`: 欲查詢的頁面.
  - `quantity (Integer)`: 每頁顯示的紀錄數量.
-  **Required:**

  `none`

- **Success Response:**
  - **Code:** 200 
    **Content:**
    `當前獎品的資訊`
   ```json
    {
      "status":true, // Boolean
      "prizeList":[{
          "prizeId":1, // Integer
          "prizeProbability":40.15, // Float
          "quantity":5, // Integer
          "prizeName":"香蕉", // String
          "img":"url", // URL
          },{
          "prizeId": 2, // Integer
          "prizeProbability": 10.25, // Float
          "quantity":1, // Integer
          "prizeName": "蘋果", // String
          "img":"url", // URL
          },{
          "prizeId": 3, // Integer
          "prizeProbability": 0.12, // Float 
          "quantity":1, // Integer,
          "prizeName": "手機", // String
          "img":"url", // URL
        }], // Array 
      "nowPage":1, //Integer    
      "totlePage":1, //Integer 
    }
    ```

- **Error Response:**

  - **Code:** 401 <br />
    **Content:** 
    ```json
    {
      "status":false, // Boolean
      "message":"伺服器錯誤" // String
    }
    or
    {
      "status": false, // Boolean
      "message": "非登入狀態" // String
    }
    ```



### **新增獎品**

  **URL**
  >/admin/prize/new

- **Method:**

  `POST`

- **URL Params**
  
  `none`

- **Required:**
      **Body:**

    ```json
      {
        "prizeName":"香蕉", // String
        "quantity": 10, // Integer 
        "prizeProbability":40.15, // Float
        "img":"Image Format", // Image File(png,2mb)
      }
    ```

- **Success Response:**
  >新增成功
  - **Code:** 200 <br />
    **Content:**
    `(返回成功提示或失敗提示)`
    <br />
    ```json
      {
        "status":true, // Boolean
        "message":"新增獎品成功" // String
      }
      
    ```

- **Error Response:**
  >發生錯誤
  - **Code:** 500 <br />
    **Content:**
    `返回錯舞提示`
    ```json
      {
        "status":false, //Boolean
        "message":"伺服器錯誤" //String
      }
      or
      {
        "status":false, //Boolean
        "message":"超過機率上限，剩餘機率容許" //String
      }
      or
      {
        "status": false, //Boolean
        "message": "非登入狀態" //String
      }
    ```



### **刪除獎品**

  **URL**
  >/admin/prize/delete{id}

- **Method:**

  `PUT`

- **URL Params**

  - `id (Integer)`: 獎品id.

- **Required:**
  **Body:**
  `none`

- **Success Response:**
  >新增成功
  - **Code:** 200 <br />
    **Content:**
    `(返回成功提示或失敗提示)`
    <br />
    ```json
      {
        "status":true, // Boolean
        "message":"刪除獎品成功" // String
      }
      
    ```

- **Error Response:**
  >發生錯誤
  - **Code:** 500 <br />
    **Content:**
    `返回錯舞提示`
    ```json
      {
        "status":false, //Boolean
        "message":"伺服器錯誤" //String
      }
      or
      {
        "status":false, //Boolean
        "message":"刪除獎品失敗" //String
      }
      or
      {
        "status": false, //Boolean
        "message": "非登入狀態" //String
      }
    ```


  **URL**
  >/edit_prize{id}

- **Method:**

  `PUT`

- **URL Params**
  
  - `id (Integer)`: 獎品id.

- **Required:**
      **Body:**

    ```json
    {
        "newPrizeName":"香蕉", // String
        "newQuantity": 10, // Integer 
        "newPrizeProbability":40.15, // Float
        "newImg":"newImage", // Image File(png,2mb)
    }
    ```

- **Success Response:**
  >更新成功
  - **Code:** 200 <br />
    **Content:**
    `(返回成功提示或失敗提示)`
    <br />
    ```json
        "status":true, //Boolean
        "message":"更新獎品成功" //String
    ```

- **Error Response:**
  >發生錯誤
  - **Code:** 500 <br />
    **Content:**
    `返回錯舞提示`
    ```json
      {
        "status":false, //Boolean
        "message":"伺服器錯誤" //String
      }
      or
      {
        "status":true, //Boolean
        "message":"更新獎品失敗" //String
      }
      or
      {
        "status": false, //Boolean
        "message": "非登入狀態" //String
      }
    ```