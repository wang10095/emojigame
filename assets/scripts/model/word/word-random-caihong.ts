
import { Node, _decorator, Animation } from 'cc';
import { Vec2 } from 'cc';
import { SkillBase, SkillSet } from '../skill/skill-base';
import { CircleAnimType, ModelCircle } from '../model-circle';
import { anyCircleFaceId, anyCircleType, CircleKindType, CircleState } from '../../game/constant/lw-common-define';
import { DataManager } from '../../game/data/data-manager';
import { BoxCollider2D } from 'cc';
import { getRandomInt } from '../../game/common';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { FaceKindType } from '../model-face';

const { ccclass, property } = _decorator;

//把场上的一种颜色变为彩虹  10001
@ccclass("WordRandomCaiHong")
export class WordRandomCaiHong extends SkillBase implements SkillSet {
    skillName: string;
    createPos: Vec2;

    // @property({
    //     type: BoxCollider2D
    // })
    // collider: BoxCollider2D = null;

    _curAnimCount: number = 0;

    protected onLoad(): void {
        super.onLoad();

        this.skillName = 'WordRandomCaiHong';
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
        let hadColor = [];
        for (let i = 0; i < DataManager.dataBattle.boxNode.children.length; i++) {
            const nodeCircle = DataManager.dataBattle.boxNode.children[i];
            const modelCircle = nodeCircle.getComponent(ModelCircle);
            if (modelCircle.stillExist() && modelCircle.getState() === CircleState.Pool) {
                const faceTypeData = modelCircle.getFaceTypeData();
                for (const faceType in faceTypeData) {
                    if (!hadColor.includes(Number(faceType))) {
                        hadColor.push(Number(faceType));
                    }
                }
            }
        }

        const idx = getRandomInt(0, hadColor.length - 1);
        const selectFaceType = hadColor[idx]; //选中这个类型

        console.log('===倒反天罡======================', selectFaceType)

        for (let i = 0; i < DataManager.dataBattle.boxNode.children.length; i++) {
            const nodeCircle = DataManager.dataBattle.boxNode.children[i];
            const modelCircle = nodeCircle.getComponent(ModelCircle);
            if (modelCircle.stillExist() && modelCircle.getState() === CircleState.Pool) {

                const faceTypeData = lwUtils.utils.deepClone(modelCircle.getFaceTypeData());
                for (const faceType in faceTypeData) {
                    if (Number(faceType) === selectFaceType) { //当前气泡有这个颜色

                        modelCircle.setCircleAnim(CircleAnimType.Spine);

                        modelCircle.delFace(Number(faceType), null, false); //本气泡去掉这个颜色
                        const faceInfo = faceTypeData[faceType];
                        for (const faceId in faceInfo) {
                            const count = faceInfo[faceId];
                            const faceConfig: Face = Config.Face[faceId];
                            if (faceConfig.faceKind === FaceKindType.CommonFace) {
                                modelCircle.createFace(anyCircleType, { [anyCircleFaceId]: count });
                            } else if (faceConfig.faceKind === FaceKindType.SkillFace) {
                                const faceIds = Config.Skill[faceConfig.skillId].faceIds;
                                const newFaceId = faceIds[faceIds.length - 1];
                                modelCircle.createFace(anyCircleType, { [newFaceId]: count })
                            } else if (faceConfig.faceKind === FaceKindType.WordFace) {
                                modelCircle.createFace(anyCircleType, { [faceId]: count })
                            }
                        }

                        modelCircle.transfromColorOperation(1);  //变颜色后接触检测


                    }
                }
            }
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