import { _decorator, CircleCollider2D, Collider2D, Component, Contact2DType, DistanceJoint2D, ECollider2DType, ERigidBody2DType, instantiate, IPhysics2DContact, Node, PhysicsGroup, Prefab, RigidBody2D, size, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SuperComponent } from '../frame/center/lw_components/super-component';

import { Label } from 'cc';
import { UI_LW_EVENT_NAME } from '../game/constant/lw-common-define';
import { convertToNodeSpaceLWAR, convertToWorldSpaceLWAR, createLizi } from '../game/ui-commonset';
import { DataManager } from '../game/data/data-manager';
import { eventAfterPhysics } from '../game/common';
import { LWManager } from '../frame/center/lw-manager';
import { v3 } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { FacePerticleType } from '../game/battle/collect-face';
import { SuperSpine } from '../frame/center/lw_components/super-spine';
const { ccclass, property } = _decorator;

//锁住的气泡 只占地方
@ccclass('ModelLockCircle')
export class ModelLockCircle extends SuperComponent {
    // @property({
    //     type: CircleCollider2D
    // })
    // collider: CircleCollider2D = null;

    @property({
        type: Label
    })
    labRemainNum: Label = null;

    @property({
        type: Sprite,
        tooltip: '累积进度'
    })
    progress: Sprite = null;

    @property({
        tooltip: '设置进度数值'
    })
    fullNum: number = 0;

    @property({
        type: Node,
    })
    nodeLock: Node = null;

    @property({
        type: Node,
    })
    lockSpine: Node = null;

    _unlockNum: number = null;

    onLoad(): void {
        super.onLoad();

        this.LWRegisterMyEmit([
            UI_LW_EVENT_NAME.CIRCLE_FULL_BOOM,
        ], [
            (num: number, wordPos) => {
                this.addLockNum(num, wordPos);
            }
        ], this)
    }

    start() {
        super.start();

        // this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        this.setLockNum(0);
        this.labRemainNum.string = this.fullNum + '';
        this.lockSpine.getComponent(SuperSpine).playLwSpine('idle', true);
    }

    //初始化解锁数值
    setLockNum(unlockNum: number) {
        this._unlockNum = unlockNum;
        // let remain = this.fullNum - this._unlockNum;
        // remain = remain < 0 ? 0 : remain
        // this.labRemainNum.string = remain + '';

        this.setProgress(this._unlockNum / this.fullNum);
    }

    setProgress(percent) {
        if (percent < 0) {
            percent = 0;
        }
        if (percent > 1) {
            percent = 1
        }
        const width = 60;
        const height = this.progress.getComponent(UITransform).height;
        this.progress.getComponent(UITransform).setContentSize(size(width * percent, height));
    }

    async addLockNum(delNum: number, worldPos: Vec3) {
        //低于基座下不加进度
        const wordPos = convertToWorldSpaceLWAR(this.node);
        if (wordPos.y < DataManager.dataBattle.underPinLocY - 50) {
            return;
        }

        if (this._unlockNum >= this.fullNum) {
            return;
        }

        this._unlockNum += delNum;

        const nodeLizi = await createLizi(FacePerticleType.ChainLockFly)
        nodeLizi.parent = this.progress.node.parent;

        const pos = convertToNodeSpaceLWAR(worldPos, this.progress.node.parent);
        nodeLizi.setPosition(pos.x, pos.y);
        tween(nodeLizi).to(0.4, { position: v3(0, 0, 0) }).call(() => {
            nodeLizi.destroy();

            this.setProgress(this._unlockNum / this.fullNum);
            if (this._unlockNum >= this.fullNum) {
                this.progress.node.parent.active = false;
                this.node.getChildByName('circle').getComponent(RigidBody2D).type = ERigidBody2DType.Kinematic;
                this.lockSpine.getComponent(SuperSpine).playLwSpine('open', false, () => {
                    this.nodeLock.active = false;
                    tween(this.node.getChildByName('circle')).to(0.3, { scale: v3(0.1, 0.1) }).call(() => {
                        eventAfterPhysics(() => {
                            this.node.destroy();
                        })
                    }).start()
                })
            }

        }).start();

    }

    // onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     if (otherCollider.sensor) { //碰到了传感器  （传感器一般是警戒线或者炸弹 这个由对方去判断）

    //         return;
    //     }
    // }

    // onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    // }

    update(deltaTime: number) {

    }

}


