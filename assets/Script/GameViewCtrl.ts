import GameModel from "./Model/GameModel";

const colorArr = [
  cc.color(255, 255, 255),
  cc.color(152, 200, 255),
  cc.color(100, 150, 20),
  cc.color(135, 100, 100),
  cc.color(200, 200, 200),
];
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameViewCtrl extends cc.Component {
  @property({ type: cc.Node, tooltip: "Q1添加背景" })
  bgQ1: cc.Node = null;

  @property({ type: cc.Node, tooltip: "editboxX" })
  editboxX: cc.Node = null;

  @property({ type: cc.Node, tooltip: "editboxY" })
  editboxY: cc.Node = null;

  @property({ type: cc.Node, tooltip: "btn" })
  btn: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: "方块" })
  cardItem: cc.Prefab = null;

  private gameModel: GameModel = null;
  private startScale:number = 1;
  // onLoad () {}

  start() {
    this.gameModel = GameModel.getInstance();
    this.gameModel.initModel();
    this.addListener();
  }

  addListener(){
    // 按钮监听
    this.btn.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
    this.btn.on(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
    this.btn.on(cc.Node.EventType.TOUCH_CANCEL,this.touchEnd, this);
  }

  onClickQ1Btn() {
    this.bgQ1.removeAllChildren();
    this.unscheduleAllCallbacks();
    this.gameModel.calculateProbability();
    // 整体创建
    for (let i = 0; i < this.gameModel.getCardNum(); i++) {
      this.scheduleOnce(() => {
        let cardItem = cc.instantiate(this.cardItem);
        // 计算每个格子的位置
        let cardPosition = this.gameModel.calculateCardPos(i + 1, cardItem);
        // 传入坐标计算概率
        this.gameModel.calculateAndUpdatePercentage(i + 1);
        // 根据概率处理格子的颜色
        let color = this.gameModel.calculateCardColor();
        // 根据确定颜色更改概率
        this.gameModel.setCardColor(i + 1, color);
        cardItem.color = color;
        cardItem.setPosition(cardPosition);
        this.bgQ1.addChild(cardItem);
      }, i * 0.05);
    }
  }

  onClickOkBtn() {
    let countX = parseInt(this.editboxX.getComponent(cc.EditBox).string) || 0;
    let countY = parseInt(this.editboxY.getComponent(cc.EditBox).string) || 0;
    this.gameModel.setXInputNum(countX);
    this.gameModel.setYInputNum(countY);
  }

  onClickQ3Btn() {
    if(this.btn.active){
      this.btn.active = false;
    }
    this.scheduleOnce(()=>{
      this.btn.stopAllActions();
      this.btn.active = true;
      this.btn.scale = 0.2;
      this.btn.rotation = -5;
      this.btn.runAction(
        cc.sequence(
          cc.spawn(
            cc.sequence(cc.scaleTo(0.1, 1.2, 0.9), cc.scaleTo(0.1, 1, 1)),
            cc.sequence(
                cc.rotateTo(0.1, 5),
                cc.rotateTo(0.1, -10),
                cc.rotateTo(0.1, 5),
                cc.rotateTo(0.1, 0)
              ).repeat(5)
          ),
          cc.callFunc(() => {
            this.btn.runAction(
              cc.sequence(
                  cc.scaleTo(0.2, this.startScale*(1 + 0.05),this.startScale*(1 - 0.05)),
                  cc.scaleTo(0.4,  this.startScale*(1 - 0.05),this.startScale*(1 + 0.05)),
                  cc.scaleTo(0.2, this.startScale, this.startScale)
                ).repeatForever()
            );
          })
        )
      );
    },0.1)
   
  }

  touchStart(){
    // this.btn.scale = 0.6
    this.btn.stopAllActions();
    this.startScale = 0.8
    this.btn.scale = this.startScale
    this.btn.runAction(
      cc.sequence(
          cc.scaleTo(0.2, this.startScale*(1 + 0.05),this.startScale*(1 - 0.05)),
          cc.scaleTo(0.4,  this.startScale*(1 - 0.05),this.startScale*(1 + 0.05)),
          cc.scaleTo(0.2, this.startScale, this.startScale)
        ).repeatForever()
    );
   
  }   

  touchEnd(){
    this.btn.stopAllActions();
    this.startScale = 1;
    this.btn.scale = this.startScale
    this.btn.runAction(
      cc.sequence(
          cc.scaleTo(0.2, this.startScale*(1 + 0.05),this.startScale*(1 - 0.05)),
          cc.scaleTo(0.4,  this.startScale*(1 - 0.05),this.startScale*(1 + 0.05)),
          cc.scaleTo(0.2, this.startScale, this.startScale)
        ).repeatForever()
    );
  }

  // update (dt) {}
}
