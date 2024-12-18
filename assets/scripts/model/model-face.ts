import { _decorator, Animation, CircleCollider2D, Collider2D, Contact2DType, ERigidBody2DType, instantiate, IPhysics2DContact, macro, Node, PhysicsGroup, Prefab, RigidBody2D, size, sp, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SuperComponent } from '../frame/center/lw_components/super-component';

import { DataManager } from '../game/data/data-manager';
import { LWManager } from '../frame/center/lw-manager';
import { FacePerticleType } from '../game/battle/collect-face';
import { getGlobalCfgValue } from '../game/common';
import { createLizi } from '../game/ui-commonset';
import { SuperSpine } from '../frame/center/lw_components/super-spine';
import { SuperAnimation } from '../frame/center/lw_components/super-animal';
import { UI_LW_EVENT_NAME } from '../game/constant/lw-common-define';
const { ccclass, property } = _decorator;


export enum FaceKindType {
    None = 0,
    CommonFace = 1, //氛围表情
    SkillFace = 2, //技能表情
    WordFace = 3,//词条表情
    AnyFace = 4, //彩虹表情
}

export enum FaceAnimType {
    None = 0,
    Anim = 1,
    Spine = 2,
}


@ccclass('ModelFace')
export class ModelFace extends SuperComponent {
    @property({
        type: CircleCollider2D
    })
    collider: CircleCollider2D = null;

    @property({
        type: Sprite,
        tooltip: 'face背景'
    })
    bg: Sprite = null;

    @property({
        type: Sprite,
        tooltip: 'face图片'
    })
    sprite: Sprite = null;

    @property({
        type: Node,
        tooltip: 'face_Spine'
    })
    spine: Node = null;

    private _faceType: number = null;
    private _faceId: number = null;  //唯一编号
    private _faceKind: FaceKindType = null;
    private _func = null; //当前只支持扫光的动画

    onLoad(): void {
        super.onLoad();
        this.LWRegisterMyEmit([
            UI_LW_EVENT_NAME.CIRCLE_FIRST_CONTACT, //气泡落下首次碰撞 警戒线以下
        ], [
            this.changeAnimation,
        ], this);
    }

    start() {
        super.start();
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    changeAnimation() {
        const faceId = this._faceId;
        const faceConfig = Config.Face[faceId];
        if (faceConfig.faceKind === FaceKindType.SkillFace) {
            // 技能扫光更改间隔
            this.unschedule(this._func);
            this.setFaceAnim(FaceAnimType.Anim, 2);
        }
    }

    //radius 半径 
    setRadius(radius: number) {
        this.sprite.getComponent(UITransform).setContentSize(size(radius * 2, radius * 2));

        this.collider.radius = radius;
        this.collider.apply();
    }

    //设置刚体类型 默认是Dynamic
    setRigidBodyType(type = ERigidBody2DType.Dynamic) {
        this.node.getComponent(RigidBody2D).type = type;
    }

    setFaceType(faceType: number) {
        this._faceType = faceType;
    }

    setFaceId(faceId: number) {
        this._faceId = faceId;
    }

    setFaceKind(faceKind: number) {
        this._faceKind = faceKind
    }

    getFaceKind() {
        return this._faceKind;
    }

    getFaceId() {
        return this._faceId;
    }

    getFaceType() {
        return this._faceType;
    }



    async setFaceImage() {
        const faceConfig = DataManager.dataBattle.faceConfig[this._faceId];

        const faceName = faceConfig.image;
        const path = `model://image/${faceName}/spriteFrame`;
        const spriteFrame: SpriteFrame = await LWManager.lwbundleManager.load<SpriteFrame>(path, SpriteFrame);
        if (this.node && this.node.isValid) {
            this.sprite.spriteFrame = spriteFrame;

            const faceConfig: Face = DataManager.dataBattle.faceConfig[this._faceId];
            if (faceConfig.faceKind === 3) {
                const path = `model://image/${this._faceType}/spriteFrame`;
                console.log('=======pathpathpath=========', path);
                const spriteFrame: SpriteFrame = await LWManager.lwbundleManager.load<SpriteFrame>(path, SpriteFrame);
                if (this.node && this.node.isValid) {
                    this.bg.spriteFrame = spriteFrame;
                    const transform = this.bg.getComponent(UITransform);
                    transform.width = Number(getGlobalCfgValue('faceSize'));
                    transform.height = Number(getGlobalCfgValue('faceSize'));
                }
            }
        }
    }

    setFaceAnim(_type: FaceAnimType, interver: number = 0) {
        if (_type === FaceAnimType.Anim) {
            this.setAnimation('scan', interver);
        } else if (_type === FaceAnimType.Spine) {
            this.setSpine('ui_Aperture', interver);
        }
    }

    //设置face上的spine
    private async setSpine(name: string, interver: number) {
        const path = `model://spine/${name}`;
        console.log('=====setSpine=====spine========', path);
        const skeletonData: sp.SkeletonData = await LWManager.lwbundleManager.load<sp.SkeletonData>(path, sp.SkeletonData);
        if (this.node && this.node.isValid) {
            this.spine.active = true;
            this.spine.getComponent(sp.Skeleton).skeletonData = skeletonData;
            this.spine.getComponent(SuperSpine).playLwSpine('idle', true, () => {
                // this.spine.getComponent(sp.Skeleton).skeletonData = null;
            });
        }
    }

    //设置动画  interver 间隔多久播一次 单位 秒
    private async setAnimation(name: string, interver: number = 0) {
        const path = `model://animation/${name}`;
        console.log('=====setAnimation===========', path);

        const aniName = 'animation_' + name;

        if (!this.node.getChildByName(aniName)) {
            const prefab: Prefab = await LWManager.lwbundleManager.load<Prefab>(path, Prefab);
            if (this.node && this.node.isValid) {
                const scan = instantiate(prefab);
                scan.parent = this.node;
                scan.name = 'animation_' + name;
                scan.active = true;

                const faceSize = DataManager.dataBattle.faceSize;
                const scale = 64 / faceSize;
                console.log('==========setAnimation========scaale====', scale)
                scan.setScale(scale, scale, 1);
            }
        }


        this.unschedule(this._func);
        this._func = () => {
            const animNode = this.node.getChildByName(aniName);
            animNode.getComponent(SuperAnimation).play();
        }
        if (interver > 0) {
            this.schedule(this._func, interver + 1, macro.REPEAT_FOREVER);
        }
    }


    //初次碰撞就进行消除判断，各自判断各自的
    //只往出跑的  因为碰撞时双方相互的
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.sensor) { //碰到了传感器  （传感器一般是警戒线或者炸弹 这个由对方去判断）
            return;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }

    async addLizi(_type: FacePerticleType, zOrder: number = -1) {
        const nodeLizi = await createLizi(_type, this._faceType)
        nodeLizi.parent = this.node;
        nodeLizi.setSiblingIndex(zOrder);
    }

}


