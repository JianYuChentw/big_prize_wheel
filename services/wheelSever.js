let testTABLE = [
  {
    prizeId: 1,
    prizeProbability: '20.55',
    quantity: 7,
    prizeName: '我是獎品D',
    img: 'ertyuiop',
  },
  {
    prizeId: 2,
    prizeProbability: '1.55',
    quantity: 1,
    prizeName: '我是獎品A',
    img: 'ertyuiop',
  },
  {
    prizeId: 3,
    prizeProbability: '10.55',
    quantity: 6,
    prizeName: '我是獎品C',
    img: 'ertyuiop',
  },
  {
    prizeId: 4,
    prizeProbability: '50.55',
    quantity: 7,
    prizeName: '我是獎品E',
    img: 'ertyuiop',
  },
  {
    prizeId: 5,
    prizeProbability: '10.55',
    quantity: 4,
    prizeName: '我是獎品B',
    img: 'ertyuiop',
  },
  {
    prizeId: 6,
    prizeProbability: '5.26',
    quantity: 4,
    prizeName: '我是獎品F',
    img: 'ertyuiop',
  },
];

// 當前機率計算;
/**
 *當前機率計算
 * @param {Array} prizeBox 獎品盒
 * @returns {number} 回傳機率總和
 */
function ProbabilitySum(prizeBox) {
  // 初始總和為 0
  let sum = 0;

  // 遍歷機率表，將每項的機率轉為浮點數並加到總和上
  for (let entry of prizeBox) {
    sum += parseFloat(entry.prizeProbability);
  }

  // 返回計算結果
  console.log(`\u001b[33m`, '當前機率總和為：', `${sum}%`, `\u001b[37m`);
  return sum;
}

/**
 *亂數抽取
 * @param {Array} prizeBox 獎品盒
 * @returns {{number:prizeId,string:name,number:quantity,file:img  }| null
 * } 回傳被抽中的獎品
 */
function lotteryDraw(prizeBox) {
  // 生成介於 0 到 1 之間的隨機數
  const randomNum = (Math.random() * 100).toFixed(2);
  // console.log('本次抽得機率為:', randomNum);
  let cumulativeProbability = 0;

  // 遍歷機率表
  for (let entry of prizeBox) {
    const probability = parseFloat(entry.prizeProbability);

    // 累加機率
    cumulativeProbability += probability;

    // 判斷隨機數是否在機率區間內
    if (randomNum < cumulativeProbability) {
      // 隨機數小於等於累加機率，表示抽中該獎品
      return {
        prizeId: entry.prizeId,
        name: entry.prizeName,
        quantity: entry.quantity,
        img: entry.img,
      };
    }
  }

  // 如果沒有抽中任何獎品，可以返回 null 或其他適當的值
  return null;
}

// lotteryDraw(testTABLE);

//機率測試
function testProbability(prizes) {
  let A = 0;
  let B = 0;
  let C = 0;
  let D = 0;
  let E = 0;
  let F = 0;
  let NO = 0;

  for (let index = 0; index < 1000000; index++) {
    let result = lotteryDraw(prizes);

    // 根據抽中的獎品更新相應的計數器
    if (result === null) {
      NO++;
      continue;
    }
    if (result.prizeId === 1) {
      D++;
      continue;
    }
    if (result.prizeId === 2) {
      A++;
      continue;
    }
    if (result.prizeId === 3) {
      C++;
      continue;
    }
    if (result.prizeId === 4) {
      E++;
    }
    if (result.prizeId === 5) {
      B++;
      continue;
    }
    if (result.prizeId === 6) {
      F++;
      continue;
    }
  }

  console.log(A, B, C, D, E, NO);

  // 計算並顯示每個獎品的中獎概率
  console.log('獎品A(1.55)中獎概率:', (A / 10000).toFixed(2));
  console.log('獎品B(10.55)中獎概率:', (B / 10000).toFixed(2));
  console.log('獎品C(10.55)中獎概率:', (C / 10000).toFixed(2));
  console.log('獎品D(20.55)中獎概率:', (D / 10000).toFixed(2));
  console.log('獎品E(50.55)中獎概率:', (E / 10000).toFixed(2));
  console.log('獎品E(5.26)中獎概率:', (F / 10000).toFixed(2));
  console.log('未中獎率:', (NO / 10000).toFixed(2));
}

module.exports = {
  ProbabilitySum,
  lotteryDraw,
};
