import GameVo from "../Vo/GameVo";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameModel {
  static _instance: GameModel = null;

  static getInstance(): GameModel {
    if (GameModel._instance == null) {
      GameModel._instance = new GameModel();
    }
    return GameModel._instance;
  }
  gameVo: GameVo = null;
  // 选定颜色数组
  private colorArr = [
    cc.color(255, 192, 203),
    cc.color(238, 130, 238),
    cc.color(230, 230, 250),
    cc.color(119, 136, 153),
    cc.color(0, 255, 0),
  ];
  // 初始位置
  private starPosition = cc.v2(-180, 180);
  // 行
  private line = 10;
  // 列
  private column = 10;
  // 基数概率和
  private totalPre = 100;
  initModel() {
    // 初始化
    if (!this.gameVo) {
      this.gameVo = new GameVo();
    }
  }

  setXInputNum(num: number) {
    this.gameVo.xInputNum = num;
  }

  getXInputNum() {
    return this.gameVo.xInputNum;
  }

  setYInputNum(num: number) {
    this.gameVo.yInputNum = num;
  }

  getYInputNum() {
    return this.gameVo.yInputNum;
  }

  getColorPrecentageList() {
    return this.gameVo.colorPrecentageList;
  }

  setColorPrecentage(index: number, precentNum: number) {
    if (precentNum < 0) precentNum = 0;
    if (precentNum > this.totalPre) precentNum = this.totalPre;
    this.gameVo.colorPrecentageList[index] = precentNum;
  }

  getCardColor(index: number) {
    return this.gameVo.cardColorList[index];
  }

  setCardColor(index: number, color: cc.Color) {
    this.gameVo.cardColorList[index] = color;
  }

  getColorIndex(color: cc.Color): number {
    let colorIndex = 0;
    this.colorArr.forEach((itemClolr, index) => {
      if (itemClolr == color) {
        colorIndex = index;
      }
    });
    return colorIndex;
  }

  getCardNum() {
    return this.line * this.column;
  }

  calculateProbability() {
    let precentageNum = this.totalPre / this.colorArr.length;
    for (let i = 0; i < this.colorArr.length; i++) {
      this.gameVo.colorPrecentageList[i] = precentageNum;
    }
  }

  calculateCardPos(index: number, cardItem: cc.Node): cc.Vec2 {
    if (index == 1) {
      return this.starPosition;
    }
    let cardSize = cardItem.getContentSize();
    let xIndex = index % this.line == 0 ? this.line : index % this.line;
    let yIndex = Math.ceil(index / this.column);
    let posX = this.starPosition.x + (xIndex - 1) * cardSize.width;
    let posY = this.starPosition.y - (yIndex - 1) * cardSize.height;
    return cc.v2(posX, posY);
  }

  calculateCardColor(): cc.Color {
    let probabilities = this.getColorPrecentageList();

    let randomNumber = Math.random() * this.totalPre;
    let cumulativeProbability = 0;
    let index = this.colorArr.length - 1;
    console.log("probabilities", probabilities);
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (randomNumber < cumulativeProbability) {
        index = i;
        break;
      }
    }
    return this.colorArr[index];
  }

  calculateAndUpdatePercentage(index: number): void {
    let xIndex = index % this.line == 0 ? this.line : index % this.line;
    let yIndex = Math.floor(index / this.column);
    let topY = yIndex - 1;
    let leftX = xIndex - 1;
    let cardTopIndex = -1;
    let cardLeftIndex = -1;
    if (topY > 0) {
      // 上方坐标点存在
      cardTopIndex = topY * this.column + xIndex;
    }
    if (leftX > 0) {
      // 左边坐标点存在
      cardLeftIndex = yIndex * this.column + leftX;
    }

    if (cardTopIndex !== -1 && cardLeftIndex !== -1) {
      if (this.getCardColor(cardTopIndex) == this.getCardColor(cardLeftIndex)) {
        // 如果颜色相等则对应颜色概率增加Y%
        this.isTopAndLeftSame(cardTopIndex);
      } else {
        // 都存在但是颜色不相同，各自增加
        this.isNotSame(cardTopIndex, cardLeftIndex);
      }
      return;
    }
    if (cardTopIndex !== -1) {
      // 单独增加此颜色概率
      this.singleUpdate(cardTopIndex);
    }

    if (cardLeftIndex !== -1) {
      // 单独增加此颜色概率
      this.singleUpdate(cardLeftIndex);
    }
  }

  singleUpdate(cardIndex: number) {
    let color = this.getCardColor(cardIndex);
    let colorIndex = this.getColorIndex(color);
    if (!cardIndex) return;
    let oldPrecentNumber = this.gameVo.colorPrecentageList[colorIndex];
    if (oldPrecentNumber == 0) return;
    let precentNumber = (
      oldPrecentNumber + oldPrecentNumber * (this.getXInputNum() / 100)
    );
   
    let otherPrecentNum = (
      (this.totalPre - precentNumber) / (this.colorArr.length - 1)
    );
    // console.log("singleUpdate:oldPrecentNumber" + cardIndex, oldPrecentNumber);
    // console.log("singleUpdate:precentNumber" + cardIndex, precentNumber);
    // console.log("singleUpdate:otherPrecentNum" + cardIndex, otherPrecentNum);
    for (let i = 0; i < this.colorArr.length; i++) {
      this.setColorPrecentage(
        i,
        i === colorIndex ? precentNumber : otherPrecentNum
      );
    }
  }

  isNotSame(cardTopIndex: number, cardLeftIndex: number) {
    let colorTop = this.getCardColor(cardTopIndex);
    let colorTopIndex = this.getColorIndex(colorTop);
    let colorLeft = this.getCardColor(cardLeftIndex);
    let colorLeftIndex = this.getColorIndex(colorLeft);
    let oldPrecenTop = this.gameVo.colorPrecentageList[colorTopIndex];
    let oldPrecentLeft = this.gameVo.colorPrecentageList[colorLeftIndex];
    if (oldPrecenTop == 0 && oldPrecentLeft == 0) return;
    let newPrecenTop = (
      oldPrecenTop + oldPrecenTop * (this.getXInputNum() / 100)
    );
    let newPrecentLeft = (
      oldPrecentLeft + oldPrecentLeft * (this.getXInputNum() / 100)
    );
  
    let otherPrecentNum = (
      (this.totalPre - newPrecenTop - newPrecentLeft) /
        (this.colorArr.length - 2)
    );
    for (let i = 0; i < this.colorArr.length; i++) {
      if (i == colorTopIndex) {
        // console.log("isNotSame:newPrecenTop" + i, newPrecenTop);
        this.setColorPrecentage(i, newPrecenTop);
      } else if (i == colorLeftIndex) {
        // console.log("isNotSame:newPrecentLeft" + i, newPrecentLeft);
        this.setColorPrecentage(i, newPrecentLeft);
      } else {
        // console.log("isNotSame:otherPrecentNum" + i, otherPrecentNum);
        this.setColorPrecentage(i, otherPrecentNum);
      }
    }
  }

  isTopAndLeftSame(cardTopIndex: number) {
    let color = this.getCardColor(cardTopIndex);
    let colorIndex = this.getColorIndex(color);
    if (!cardTopIndex) return;
    let oldPrecentNumber = this.gameVo.colorPrecentageList[colorIndex];
    if (oldPrecentNumber == 0) return;
    let precentNumber = (
      oldPrecentNumber + oldPrecentNumber * (this.getYInputNum() / 100)
    );
    let otherPrecentNum = (
      (this.totalPre - precentNumber) / (this.colorArr.length - 1)
    );
    // console.log(
    //   "isTopAndLeftSame:oldPrecentNumber" + cardTopIndex,
    //   oldPrecentNumber
    // );
    // console.log("isTopAndLeftSame:precentNumber" + cardTopIndex, precentNumber);
    // console.log(
    //   "isTopAndLeftSame:otherPrecentNum" + cardTopIndex,
    //   otherPrecentNum
    // );
    for (let i = 0; i < this.colorArr.length; i++) {
      this.setColorPrecentage(
        i,
        i === colorIndex ? precentNumber : otherPrecentNum
      );
    }
  }

  /** --获取指定随机范围n个整数
   * @param  {} n 起始位置
   * @param  {} m 结束位置
   * @param  {} num 返回数量
   */
  getRandomNum(n: number, m: number, num: number): number[] {
    let arr = new Array();
    if (num < 1) {
      return arr;
    }
    for (let i = 0; i < m - n; i++) {
      arr[i] = n + i;
    }
    arr.sort(() => {
      return 0.5 - Math.random();
    });
    if (arr.length < num) {
      return arr;
    }
    return arr.slice(0, num);
  }

  /** --获取指定随机范围整数
   * @param  {} n 起始位置
   * @param  {} m 结束位置
   */
  getRandomRangeNum(n: number, m: number): number {
    let c = m - n + 1;
    return Math.floor(Math.random() * c + n);
  }
}
