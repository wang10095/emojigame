
import { Node, _decorator, Animation } from 'cc';
import { Vec2 } from 'cc';
import { SkillBase, SkillSet } from '../skill/skill-base';
import { ModelCircle } from '../model-circle';
import { CircleState } from '../../game/constant/lw-common-define';
import { DataManager } from '../../game/data/data-manager';
import { BoxCollider2D } from 'cc';
import { getRandomInt } from '../../game/common';

const { ccclass, property } = _decorator;

//强到爆炸
@ccclass("WordTuiTuiTui")
export class WordTuiTuiTui extends SkillBase implements SkillSet {
    skillName: string;
    createPos: Vec2;

    @property({
        type: BoxCollider2D
    })
    collider: BoxCollider2D = null;

    // @property({
    //     type: [Animation],
    //     tooltip: '菜单对应内容'
    // })
    // nodeAnim: Animation[] = [];

    _curAnimCount: number = 0;

    protected onLoad(): void {
        super.onLoad();

        this.skillName = 'WordTuiTuiTui';
        console.log("========Skill Create=========", this.skillName);

        this.LWRegisterMyEmit([
            'random_boom',
        ], [
            this.randomBoom,
        ], this);

        // this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    start(): void {
        super.start();
    }

    setCreatePos(pos: Vec2) {
        this.createPos = pos;
        this.node.setPosition(pos.x, pos.y); //设置世界坐标
    }

    randomBoom() { //随机爆一个
        let nodes = [];
        for (let i = 0; i < DataManager.dataBattle.boxNode.children.length; i++) {
            const nodeCircle = DataManager.dataBattle.boxNode.children[i];
            if (nodeCircle.getComponent(ModelCircle).stillExist() && nodeCircle.getComponent(ModelCircle).getState() === CircleState.Pool) {
                nodes.push(nodeCircle);
            }
        }
        console.log('=========randomBoom====================', nodes.length)
        if (DataManager.dataBattle.boxNode && nodes.length > 0) {

            const idx = getRandomInt(0, nodes.length - 1);
            const nodeCircle = nodes[idx];
            nodeCircle.getComponent(ModelCircle).destorySelf(true);

        } else {
            console.log('========没有找到box节点======');
        }
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