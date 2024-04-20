const { ccclass, property } = cc._decorator;

@ccclass
export default class GameVo {
  // 颜色概率
  colorPrecentageList: number[] = [];
  // 格子颜色
  cardColorList: cc.Color[] = [];
  // 输入框x
  xInputNum:number = 0;
  // 输入框y
  yInputNum:number = 0;
}
