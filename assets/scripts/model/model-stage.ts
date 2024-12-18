import { _decorator, CircleCollider2D, Collider2D, Component, Contact2DType, DistanceJoint2D, ECollider2DType, ERigidBody2DType, instantiate, IPhysics2DContact, Node, PhysicsGroup, Prefab, RigidBody2D, size, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SuperComponent } from '../frame/center/lw_components/super-component';
const { ccclass, property } = _decorator;

@ccclass('ModelStage')
export class ModelStage extends SuperComponent {
    @property({
        type: [Node],
        tooltip: '每一关的父节点'
    })
    nodeLevels: Node[] = []; //每一关的父节点

    @property({
        type: [Node],
        tooltip: '每一关底座的位置线'
    })
    nodeUnderpin: Node[] = []; //每一关底座的位置线

    @property({
        type: [Node],
        tooltip: '每一关底座body'
    })
    nodeUnderpinBody: Node[] = []; //底座body

    @property({
        type: [Node],
        tooltip: '每一关障碍物的父节点'
    })
    nodeBarrier: Node[] = []; //每一关障碍物的父节点

    onLoad(): void {
        super.onLoad();
    }

    start() {
        super.start();

        this.nodeLevels.forEach((nodeLevel) => {
            nodeLevel.active = false;
        })
        this.nodeLevels[0].active = true
    }

    getUnderPinByIdx(idx) {
        return this.nodeUnderpin[idx];
    }

    //唤醒地板刚体
    wakeUpBody(idx) {
        this.nodeLevels[idx].active = true;
        this.nodeUnderpinBody[idx].getComponent(RigidBody2D).wakeUp();
        if (idx > 1) {
            this.nodeLevels[idx - 1].active = false;
            // this.nodeBarrier[idx - 1].children.forEach((node) => { //受重力的障碍物转变父节点
            //     changeParent(node, this.nodeBarrier[idx]);
            // })
        }
    }

    update(deltaTime: number) {

    }

}


