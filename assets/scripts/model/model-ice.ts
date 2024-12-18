import { _decorator, CircleCollider2D, Collider2D, Component, Contact2DType, DistanceJoint2D, ECollider2DType, ERigidBody2DType, instantiate, IPhysics2DContact, Node, PhysicsGroup, Prefab, RigidBody2D, size, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SuperComponent } from '../frame/center/lw_components/super-component';

import { ModelCircle } from './model-circle';
import { CircleState, GroupType, UI_LW_EVENT_NAME } from '../game/constant/lw-common-define';
import { BoxCollider2D } from 'cc';
import { Label } from 'cc';
import { sp } from 'cc';
import { SuperSpine } from '../frame/center/lw_components/super-spine';
import { eventAfterPhysics } from '../game/common';
const { ccclass, property } = _decorator;

//冰块 
@ccclass('ModelIce')
export class ModelIce extends SuperComponent {
    @property({
        type: BoxCollider2D
    })
    collider: BoxCollider2D = null;

    @property({
        type: sp.Skeleton
    })
    spine: sp.Skeleton = null;

    @property({
        tooltip: '被爆几次后消失'
    })
    boomNumber: number = 0;

    _boomNum: number = 0;

    onLoad(): void {
        super.onLoad();

        this.LWRegisterMyEmit([

        ], [

        ], this)

        this.initBoomNum(this.boomNumber);
    }

    // boom boom1 idle idle1
    start() {
        super.start();

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.spine.getComponent(SuperSpine).playLwSpine('idle', false);
    }

    initBoomNum(num: number) {
        this._boomNum = num;
        this.node.getChildByName('count').getComponent(Label).string = this._boomNum + '';
    }

    delBoomNum(num: number = 1) {
        this._boomNum -= num;
        this.node.getChildByName('count').getComponent(Label).string = this._boomNum + '';

        if (this._boomNum === 1) {
            this.spine.getComponent(SuperSpine).playLwSpine('boom', false, () => {
                this.spine.getComponent(SuperSpine).playLwSpine('idle1', false);
            });
        }

        if (this._boomNum == 0) {
            this.spine.getComponent(SuperSpine).playLwSpine('boom1', false, () => {
                eventAfterPhysics(() => {
                    this.node.destroy();
                })
            });
        }
    }

    //radius 半径 
    setSize(width: number, height: number) {
        this.node.getComponent(UITransform).setContentSize(size(width, height));

        this.collider.size = size(width, height);
        this.collider.apply();
    }

    //初次碰撞就进行消除判断，各自判断各自的
    //只往出跑的  因为碰撞时双方相互的
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // if (otherCollider.sensor) { //碰到了传感器  （传感器一般是警戒线或者炸弹 这个由对方去判断） 

        if (otherCollider.TYPE === ECollider2DType.CIRCLE && otherCollider.group === GroupType.Circle) {
            const modelCircle = otherCollider.getComponent(ModelCircle);
            if (modelCircle.getState() === CircleState.Delete && !(modelCircle.node as any).iceBoom) {
                modelCircle.node.attr({ iceBoom: 1 });
                this.delBoomNum(1);
            }
        }

        return;
        // }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }

}


