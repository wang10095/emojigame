import { _decorator, ERigidBody2DType, instantiate, IPhysics2DContact, Node, PhysicsGroup, Prefab, RigidBody2D, size, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SuperComponent } from '../frame/center/lw_components/super-component';

import { UI_LW_EVENT_NAME } from '../game/constant/lw-common-define';
import { Label } from 'cc';
import { convertToNodeSpaceLWAR, convertToWorldSpaceLWAR, createLizi } from '../game/ui-commonset';
import { DataManager } from '../game/data/data-manager';
import { Vec3 } from 'cc';
import { eventAfterPhysics } from '../game/common';
import { LWManager } from '../frame/center/lw-manager';
import { tween } from 'cc';
import { v3 } from 'cc';
import { SuperSpine } from '../frame/center/lw_components/super-spine';
import { FacePerticleType } from '../game/battle/collect-face';
const { ccclass, property } = _decorator;

@ccclass('ModelChain')
export class ModelChain extends SuperComponent {
    // @property({
    //     type: CircleCollider2D
    // })
    // collider: CircleCollider2D = null;

    @property({
        type: Boolean,
        displayName: '是否是托底底座'
    })
    isUnderPin: Boolean = false;

    @property({
        type: Label,
    })
    labRemainNum: Label = null;

    @property({
        type: Sprite,
        tooltip: '累积进度'
    })
    progress: Sprite = null;

    @property({
        tooltip: '锁链耐久度'
    })
    fullNum: number = 0;

    @property({
        type: Node
    })
    nodeProgress: Node = null;

    @property({
        type: Node,
        tooltip: "spine"
    })
    spine: Node = null;

    @property({
        type: Node,
        tooltip: "lock_spine"
    })
    lockSpine: Node = null;

    _unlockNum: number = 0;
    _isValid: boolean = true;

    onLoad(): void {
        super.onLoad();

        this.LWRegisterMyEmit([
            UI_LW_EVENT_NAME.CIRCLE_FULL_BOOM,
        ], [
            (num: number, wordPos) => {
                this.addLockNum(num, wordPos);
            }
        ], this)

        this._isValid = true;
    }

    start() {
        super.start();

        // this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        this.setLockNum(0);
        this.labRemainNum.string = this.fullNum + '';

        this.spine.getComponent(SuperSpine).playLwSpine('idle', true);
        this.lockSpine.getComponent(SuperSpine).playLwSpine('idle', true);
    }

    //设置刚体类型 默认是Dynamic
    setRigidBodyType(type = ERigidBody2DType.Dynamic) {
        this.node.getComponent(RigidBody2D).type = type;
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
        const selfWordPos = convertToWorldSpaceLWAR(this.node);
        if (selfWordPos.y < DataManager.dataBattle.underPinLocY - 50) {
            return;
        }

        //进度已经满了 不保险因为 气泡可能在同一帧爆炸 同一帧发过来
        if (this._unlockNum >= this.fullNum) {
            console.log('====full================', this._unlockNum)
            return;
        }
        this._unlockNum += delNum;

        // const nodePrefab = await LWManager.lwbundleManager.load<Prefab>("battle://particle/Prefabs/FX_particle001_yellow", Prefab);
        // if (!nodePrefab) {
        //     console.error("create new skill prefab error");
        //     return;
        // }
        const nodeLizi = await createLizi(FacePerticleType.ChainLockFly)
        nodeLizi.parent = this.progress.node.parent;

        const pos = convertToNodeSpaceLWAR(worldPos, this.progress.node.parent);
        nodeLizi.setPosition(pos.x, pos.y);
        tween(nodeLizi).to(0.4, { position: v3(0, 0, 0) }).call(() => {
            nodeLizi.destroy();
            this.setProgress(this._unlockNum / this.fullNum);
            if (this._unlockNum >= this.fullNum) {
                this.nodeProgress.active = false
                this.lockSpine.getComponent(SuperSpine).playLwSpine('open', false);

                eventAfterPhysics(() => {
                    if (this.isUnderPin && this._isValid) {
                        this._isValid = false
                        this.spine.getComponent(SuperSpine).playLwSpine('boom', false, () => {
                            this.lwDispatchEmit(UI_LW_EVENT_NAME.UNDERPIN_DESTORY_BROADCAST);
                            this.node.destroy();
                        });
                    } else {
                        console.log('=============不是底座======================');
                        if (this._isValid) {
                            this._isValid = false;
                            this.node.destroy();
                        }
                    }
                })
            }

        }).start();

    }

    //初次碰撞就进行消除判断，各自判断各自的
    // //只往出跑的  因为碰撞时双方相互的
    // onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {


    // }

    // onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    // }

    update(deltaTime: number) {

    }

}


