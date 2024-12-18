
import { Node, _decorator, Animation } from 'cc';
import { Vec2 } from 'cc';
import { SkillBase, SkillSet } from '../skill/skill-base';
import { UI_LW_EVENT_NAME } from '../../game/constant/lw-common-define';

const { ccclass, property } = _decorator;

//把准备发射的气泡face变为彩虹 10002
@ccclass("WordChangeCaiHong")
export class WordChangeCaiHong extends SkillBase implements SkillSet {
    skillName: string;
    createPos: Vec2;

    // @property({
    //     type: BoxCollider2D
    // })
    // collider: BoxCollider2D = null;

    _curAnimCount: number = 0;

    protected onLoad(): void {
        super.onLoad();

        this.skillName = 'WordChangeCaiHong';
        console.log("========Skill Create=========", this.skillName);

        this.LWRegisterMyEmit([

        ], [

        ], this);

        // this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    start(): void {
        super.start();

        this.randomBoom();
    }

    setCreatePos(pos: Vec2) {
        this.createPos = pos;
        this.node.setPosition(pos.x, pos.y); //设置世界坐标
    }

    randomBoom() {
        this.lwDispatchEmit(UI_LW_EVENT_NAME.READY_CIRCLE_CHANGE_CAIHONG);
    }



    // //爆炸碰撞
    // onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     if (otherCollider.TYPE === ECollider2DType.CIRCLE && otherCollider.group === GroupType.Circle) {
    //         console.log('==============booom====onBeginContact===============')
    //         //让爆照范围内的气泡都炸掉 

    //         const otherCircle = otherCollider.getComponent(ModelCircle);
    //         if (otherCircle.getState() === CircleState.Pool) { //炸掉池子里的气泡
    //             otherCircle.destorySelf(true);
    //         }
    //     }
    // }

    // onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    // }















}