import { _decorator, Node, Label, UITransform, find, Color, view, Widget, v3, sys, Sprite, isValid, UIOpacity, Prefab, instantiate, EventTouch, DistanceJoint2D, RigidBody, RigidBody2D, size, CircleCollider2D, ParticleSystem, SpriteFrame, Texture2D, v2, ERigidBody2DType, director, tween } from 'cc';
import { SuperScene } from '../../frame/center/lw_components/super-scene';
import { LWManager } from '../../frame/center/lw-manager';
import { UI_TYPE_BY_LW, uiManager } from '../../frame/center/lw_managers/ui-manager';
import { DataManager } from '../data/data-manager';
import { bezierCurveTo2, changeParent, convertToNodeSpaceLWAR, convertToWorldSpaceLWAR, createLizi, gotoLWScene, setSecureSpriteFrame, setSecuretNodeString } from '../ui-commonset';
import { CircleAnimType, ModelCircle } from '../../model/model-circle';
import { anyCircleFaceId, anyCircleType, CircleKindType, CircleState, CountdownTypeByLw, UI_LW_EVENT_NAME, UI_NAME } from '../constant/lw-common-define';
import { ToastLw } from '../../frame/center/lw_components/lw-toast';
import { macro } from 'cc';
import { ModelStage } from '../../model/model-stage';
import { Layout } from 'cc';
import { CollectFace, FacePerticleType } from './collect-face';
import SkillDefine, { PropType, SkillPosType } from '../constant/skill-define';
import { ModelLine } from '../../model/model-line';
import { TimerLabelByLw } from '../../frame/center/lw_components/timer-label';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { SkillStatus } from '../data/data-skill';
import { eventAfterPhysics, getGlobalCfgValue, getRandomInt } from '../common';
import { SuperSpine } from '../../frame/center/lw_components/super-spine';
import { FaceKindType, ModelFace } from '../../model/model-face';
import { Tween } from 'cc';
import { sdkUtils } from '../../frame/sdk-common/sdk-utils';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import { systemEvent } from 'cc';
import { SystemEvent } from 'cc';
import { KeyCode } from 'cc';
import { EventKeyboard } from 'cc';
import ScrollReuse from '../../frame/center/lw_components/scroll-endless';

export enum FailType {
    None = 0,
    DeadLine = 1, //超时
    WarnLine = 2,//警戒线失败
}

const { ccclass, property } = _decorator;

@ccclass('battle')
export class battle extends SuperScene {
    @property({
        type: Node,
        displayName: '顶部的区域'
    })
    topNode: Node;

    @property({
        type: Node,
        displayName: '背景的节点'
    })
    bgNode: Node;

    @property({
        type: Node,
        displayName: '中间的区域'
    })
    centerNode: Node;

    @property({
        type: Node,
        tooltip: 'touch'
    })
    nodeTouch: Node;

    @property({
        type: Node,
        tooltip: '技能节点'
    })
    nodeSkill: Node = null;

    @property({
        type: Node,
        tooltip: '关卡节点'
    })
    nodeStage: Node = null; //关卡节点

    @property({
        type: Node,
        tooltip: '新气泡的父节点'
    })
    nodeReadyCircle: Node = null; //准备下落气泡的父节点

    @property({
        type: Node,
        tooltip: '等待气泡的父节点'
    })
    nodeWaitCircle: Node = null; //等待气泡的父节点

    @property({
        type: Label,
        tooltip: '剩余步数',
    })
    labRemainTime: Label = null;

    @property({
        type: Node,
        tooltip: '收集栏',
    })
    layoutCollect: Node = null;

    @property({
        type: [Node]
    })
    collectSpines: Node[] = [];

    @property({
        type: Node,
        tooltip: '警戒线',
    })
    warnLine: Node = null;

    @property({
        type: Node,
        tooltip: '底座对准节点',
    })
    underPinLine: Node = null;

    @property({
        type: Node,
        tooltip: '词条收集区'
    })
    scrollView: Node = null;

    @property({
        type: [Node],
        tooltip: '展示区域（上中下）',
    })
    nodeLocation: Node[] = [];

    @property({
        type: Prefab
    })
    prefabCollectFace: Prefab = null;

    // @property({
    //     type: Node
    // })
    // nodeBox2: Node = null;

    @property({
        type: Node,
    })
    nodeGrayLayer: Node = null;

    @property({
        type: Node,
    })
    stopTouch: Node = null; //全屏屏蔽触摸

    @property({
        type: Node,
    })
    maskAll: Node = null; //全屏黑

    @property({
        type: Node,
    })
    nextSpine: Node = null; //切下一关的spine特效

    @property({
        type: [Node]
    })
    battlProps: Node[] = [];

    @property({
        type: [SpriteFrame]
    })
    battlPropFrame: SpriteFrame[] = [];

    @property({
        type: SpriteFrame
    })
    bgColelctSpriteFrame: SpriteFrame = null;

    @property({
        type: Node
    })
    bg_scroll: Node = null;

    nodeGrayLayer2: Node = null;
    nodeBox: Node = null; //所有气泡的父节点 
    _curCircle: Node = null; //当前准备下落的气泡
    _waitCircle: Node = null; //在右上角等待的气泡
    _loseCount: number = 0;
    _canFall: boolean = false;
    _canTouch: boolean = true;
    _shootCount: number = -1;

    isGameEnd: boolean = false;

    failType: FailType = FailType.None;
    battlePropCount: Array<number> = [0, 0, 0];

    onLoad(): void {

        super.onLoad();
        DataManager.currentSceneName = 'battle';
        this.LWRegisterMyEmit(
            [
                UI_LW_EVENT_NAME.CIRCLE_FIRST_CONTACT, //气泡落下首次碰撞 警戒线以下
                UI_LW_EVENT_NAME.UNDERPIN_DESTORY_BROADCAST, //下一小关
                UI_LW_EVENT_NAME.SKILL_TRIGGER,  //技能触发 
                UI_LW_EVENT_NAME.COLLECTION_WORD, //收集词条
                UI_LW_EVENT_NAME.COLLECTION_FACE, //收集face
                UI_LW_EVENT_NAME.WORD_TRIGGER,
                UI_LW_EVENT_NAME.GAME_NEXT,
                UI_LW_EVENT_NAME.CIRCLE_TOUCH_DESTORY,
                UI_LW_EVENT_NAME.READY_CIRCLE_CHANGE_CAIHONG,
                UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE,
                UI_LW_EVENT_NAME.USE_BATTLE_PROP,
            ],
            [
                this.newCircleReady, //前一个气泡下落碰撞后 通知下一个气泡准备
                this.nextLittleStagePull,
                this.triggerSkill,
                this.collectionWord,
                this.collectionFace,
                this.triggerWord,
                this.gameEndNext,
                (flag) => {
                    if (!flag) {
                        this.nodeGrayLayer.active = false;
                        this.nodeGrayLayer2.active = false;
                        this.labRemainTime.getComponent(TimerLabelByLw).resumeLwCountDown();
                    }
                },
                this.changeFaceToCaihong,
                () => {
                    this.collectFaceAnim(false);
                },
                this.getBattleProp,
            ],
            this
        );
    }

    start() {
        super.start();
        const viewSize = view.getVisibleSize();
        // 远超设计分辨率的长屏幕，将多余的长度分： 顶 底和中间娃娃机 均分，防止上下区域过大
        const safeArea = sys.getSafeAreaRect();
        console.log('safearena:', safeArea, safeArea.y, safeArea.height);
        console.log('height:', viewSize.height - safeArea.y);
        viewSize.height -= safeArea.y;
        //记录底座线高度
        DataManager.dataBattle.underPinLocY = convertToWorldSpaceLWAR(this.underPinLine).y;

        this.addTouchEventListeners();
        this.initStage();
        this.nodeGrayLayer.active = false;

        this.maskAll.active = true; //全屏黑遮罩显示  要出现收集板动画
        this.nextSpine.active = false; //进行下一关特效
        this.topNode.getChildByName('node_collection').active = false;


        const hadGuild = lwUtils.storage.getItem('game_guild');
        if (!hadGuild) {
            uiManager.show(UI_NAME.GuildPanel)
            lwUtils.storage.setItem('game_guild', "1");
        }
    }

    //进入关卡后 收集板动画
    collectFaceAnim(isDifficulty: boolean) {
        const nodeCollection = this.topNode.getChildByName('node_collection')
        if (DataManager.dataBattle.curStage > 1) {
            nodeCollection.getChildByName('bg_collect').getComponent(Sprite).spriteFrame = this.bgColelctSpriteFrame;
            // setSecureSpriteFrame(nodeCollection.getChildByName('bg_collect'), "battle://image/bg_collect_4");
        }

        this.maskAll.active = true;

        nodeCollection.active = true;
        const wordPos = convertToWorldSpaceLWAR(nodeCollection);
        const newPos = convertToNodeSpaceLWAR(wordPos, this.maskAll);
        changeParent(nodeCollection, this.maskAll);

        nodeCollection.setPosition(-500, 0, 0);

        tween(nodeCollection).to(0.5, { position: v3(newPos.x, 0, 0) }).delay(0.5).to(0.5, { position: v3(newPos.x, newPos.y, 0) }).delay(0.3).call(() => {
            changeParent(nodeCollection, this.topNode);
            this.maskAll.active = false;
        }).start();

        if (isDifficulty) {
            this._canTouch = false; //屏蔽触摸
            const nodeDifficulty = this.ui.getChildByName('difficulty');
            nodeDifficulty.active = true;
            nodeDifficulty.setPosition(800, 0, 0);

            tween(nodeDifficulty).delay(1.8 + 0.5).call(() => {
                this.maskAll.active = true;
            }).to(0.5, { position: v3(0, 0, 0) }).delay(0.8).to(0.5, { position: v3(-800, 0, 0) }).call(() => {
                nodeDifficulty.active = false;
                this.maskAll.active = false;
                this._canTouch = true;
            }).start();

        }
    }

    //收集face 飞到收集栏或者四散开来
    async collectionFace(nodes: Array<Node>, warnBoom: boolean = false) {
        const curStageConfig: Stage = DataManager.dataBattle.stageConfig;
        let checkNeedCollect = (checkFaceId: number) => {

            for (let i = 0; i < DataManager.dataBattle.collectFaceIds.length; i++) {
                const faceId = DataManager.dataBattle.collectFaceIds[i];
                if (faceId == checkFaceId) {
                    return [i, curStageConfig.collectFaceId[i]];
                }
            }

            return [-1, 0];
        }

        console.log('===========collectionFace================', nodes.length, warnBoom)
        //一定要逆序遍历
        for (let i = nodes.length - 1; i >= 0; i--) {
            const faceNode = nodes[i];
            const faceModel = faceNode.getComponent(ModelFace)
            changeParent(faceNode, this.nodeSkill);

            faceNode.getComponent(CircleCollider2D).sensor = true; //设置传感器 飞行时候不会和其他face碰撞
            const faceId = faceNode.getComponent(ModelFace).getFaceId();
            const faceConfig = Config.Face[faceId];

            const collectInfo = checkNeedCollect(faceId);
            const collectIdx = collectInfo[0];
            const needCollectNum = collectInfo[1];
            const pos = faceNode.getPosition(); //起始点坐标

            if (faceModel.getFaceKind() === FaceKindType.SkillFace) {
                //技能表情不飞走留在原地
                faceNode.getComponent(RigidBody2D).type === ERigidBody2DType.Kinematic;

                const skillConfig: Skill = Config.Skill[faceConfig.skillId];
                if (skillConfig.skillPosType === SkillPosType.ScreenPos) { //飞到指定位置
                    const location = skillConfig.location;
                    const nodeLoc = this.nodeLocation[location - 1];
                    const offSet: Array<number> = skillConfig.offSet;

                    const wordPos = convertToWorldSpaceLWAR(nodeLoc);
                    const curPos = convertToNodeSpaceLWAR(v3(wordPos.x, wordPos.y, 0), this.nodeSkill);
                    const pos = v3(curPos.x + offSet[0], curPos.y + offSet[1], 0);
                    tween(faceNode).to(0.3, { position: v3(pos.x, pos.y, 0) }).destroySelf().start();
                } else { //原地放大缩小
                    tween(faceNode).to(0.3, { scale: v3(2, 2, 1) }).to(0.3, { scale: v3(1, 1, 1) }).destroySelf().start();
                }
                continue;
            } else if (faceModel.getFaceKind() === FaceKindType.WordFace) {
                faceNode.getComponent(RigidBody2D).type === ERigidBody2DType.Kinematic;
                tween(faceNode).to(0.3, { scale: v3(0, 0, 0) }).destroySelf().start();
                continue
            }

            let hadLizi = false;
            if (!warnBoom && collectIdx >= 0 && DataManager.dataBattle.hadCollectFull[collectIdx] < needCollectNum) { //飞到收集区
                //先更新数据
                DataManager.dataBattle.hadCollectFull[collectIdx] += 1;

                // console.log('======collectionFace=======飞到收集区===================')
                const collectFaceNode = this.layoutCollect.children[collectIdx];//找到第几个收集的目标节点
                const targetWorldPos = convertToWorldSpaceLWAR(collectFaceNode);
                const targetPos = convertToNodeSpaceLWAR(targetWorldPos, this.nodeSkill); //终点坐标

                // console.log('======collectionFace=======飞到收集区===================', faceConfig)
                faceNode.getComponent(ModelFace).addLizi(FacePerticleType.FaceFly, faceConfig.faceType);

                let xx = 0
                let yy = getRandomInt(pos.y + 200, targetPos.y - 200)
                if (i % 2 === 1) { //向左
                    xx = pos.x - Math.random() * 400
                } else {
                    xx = pos.x + Math.random() * 400
                }
                const mediumPos = v3(xx, yy, 0);
                const flyTime = Math.random() * 0.2 + 1.0;

                faceNode.setRotation(0, 0, 0, 0);
                bezierCurveTo2(true, faceNode, flyTime, 1 / 30 * i, v3(pos.x, pos.y, 0), mediumPos, targetPos, { easing: 'sineInOut' }, async () => {
                    sdkUtils.vibrateLwShort(); //手机震动
                    faceNode.setRotation(0, 0, 0, 0);
                    faceNode.destroy();
                    collectFaceNode.getComponent(CollectFace).collectNum(1);
                    if (DataManager.dataBattle.checkCollectFull()) {
                        console.log('=========过关了=============s===')
                        this.gameSuccess();
                    }

                    Tween.stopAllByTarget(this.layoutCollect[collectIdx]);
                    this.layoutCollect.children[collectIdx].setScale(1, 1, 0);
                    tween(this.layoutCollect.children[collectIdx]).to(0.15, { scale: v3(1.8, 1.8, 0) }).to(0.2, { scale: v3(1, 1, 0) }).start();
                });

                if (!hadLizi) {
                    hadLizi = true;
                    this.scheduleOnce(async () => {
                        const nodeLizi = await createLizi(FacePerticleType.CollectFace)
                        nodeLizi.parent = this.layoutCollect.children[collectIdx];
                        nodeLizi.setSiblingIndex(-1);
                        nodeLizi.setScale(0.5, 0.5, 1)
                        tween(nodeLizi).delay(1.5).destroySelf().start();
                    }, flyTime)
                }
            } else { //不用收集 就四散飞走
                // console.log('=============collectionFace====四散飞走=============', faceId);
                const viewSize = view.getVisibleSize();
                let xx = i % 2 === 1 ? -viewSize.width / 2 - 300 : viewSize.width / 2 + 300;
                let yy = getRandomInt(-600, 600);
                faceNode.getComponent(ModelFace).addLizi(FacePerticleType.FaceFly);
                tween(faceNode).to(0.8, { position: v3(xx, yy, 0) }, { easing: 'quadOut' }).call(() => {
                    faceNode.destroy();
                }).start()
            }
        }
    }

    collectionWord(collectFaceIds) {
        // DataManager.dataSkill.setStatus(SkillStatus.Stop); //暂停播放技能 先收集词条

        console.log("===========collectFaceIds===1111=======", collectFaceIds);
        const scrollWorldPos = convertToWorldSpaceLWAR(this.scrollView);
        const scrllPos = convertToNodeSpaceLWAR(scrollWorldPos, this.nodeSkill); //收集栏相对于skill节点的坐标

        let startX = scrllPos.x - 500 / 2;
        let targetX = [startX + 46, startX + 128, startX + 209, startX + 290, startX + 372, startX + 454, startX + 500];
        let faceIds = [];
        const curScrollData = this.scrollView.getComponent(ScrollReuse).getData();
        for (let i = 0; i < collectFaceIds.length; i++) {
            let canFind = false;
            for (let k = 0; k < curScrollData.length; k++) {
                if (curScrollData[k][0] == collectFaceIds[i][0]) {
                    faceIds.push(k);
                    canFind = true;
                }
            }
            if (!canFind) {
                faceIds.push(-1);
            }
        }

        console.log('======collectFaceIds======faceIds=====', faceIds);

        for (let i = 0; i < collectFaceIds.length; i++) {
            const value = collectFaceIds[i];
            const faceId = value[0];
            const worldPos = value[1];

            const nodeFace = instantiate(this.prefabCollectFace);
            nodeFace.parent = this.nodeSkill;
            const pos = convertToNodeSpaceLWAR(v3(worldPos.x, worldPos.y, 0), this.nodeSkill);
            nodeFace.setPosition(pos.x, pos.y);

            nodeFace.getComponent(CollectFace).setFaceInfo([faceId, 0]);
            nodeFace.getComponent(CollectFace).addLizi(FacePerticleType.FaceFly);

            tween(nodeFace).delay(1.2).call(() => {
                if (i === 0) {
                    //来个词条栏曝光特效
                    this.collectSpines[1].active = true;
                    this.collectSpines[1].getComponent(SuperSpine).playLwSpine('idle', false, () => {
                        this.collectSpines[1].active = false;
                    });
                }
            }).start();


            let idx = faceIds[i] || 0;
            if (idx === -1) {
                idx = curScrollData.length;
            }
            idx = idx > 6 ? 6 : idx;
            const tartXX = targetX[idx];
            console.log('=============12312312======', tartXX, scrllPos.y);
            //所有词条同时飞到词条栏
            tween(nodeFace).to(0.3, { scale: v3(1.5, 1.5, 1) }).delay(0.5).to(0.5, { position: v3(tartXX, scrllPos.y, 0), scale: v3(1, 1, 1) }, { easing: 'sineIn' }).call(() => {
                const curScrollData = this.scrollView.getComponent(ScrollReuse).getData();
                console.log('================curScrollData======1111==========', JSON.stringify(curScrollData));

                DataManager.dataSkill.addWordZi(faceId, 1);  //这个时候再添加词条数据
                //词条栏收集
                if (curScrollData.find((info) => {
                    return info[0] == faceId;
                })) {
                    //curScrollData 里有这个faceId 但是cell没有了 已经被删了 那么就会出现undefine
                    console.log('================curScrollData========已经有的更新数量==========', faceId);
                    this.lwDispatchEmit(UI_LW_EVENT_NAME.COLLECTION_WORD_UPDATE, faceId); //已经有的更新数量
                } else {
                    console.log('=============curScrollData==========add=============', faceId);
                    this.scrollView.getComponent(ScrollReuse).addData(curScrollData.length, [faceId, DataManager.dataSkill.getWordZi(faceId), true]);

                    this.bg_scroll.active = this.scrollView.getComponent(ScrollReuse).getData().length <= 6;
                }

                if (i === collectFaceIds.length - 1) {
                    //检测词条是否收集全
                    DataManager.dataSkill.checkFullCollectWord();
                }
                nodeFace.active = false;

                nodeFace.destroy();
            }).start();

        }
    }

    //触发下一个技能
    async triggerSkill() {
        const curSkill = DataManager.dataSkill.curSkill; //当前触发的技能配置
        const propType = curSkill[0];
        const faceId = curSkill[1];
        const data = curSkill[2];
        const prefabName = data.prefab;

        const faceConfig: Face = DataManager.dataBattle.faceConfig[faceId];
        const skillId = faceConfig.skillId;
        const skillConfig: Skill = Config.Skill[skillId];

        const nodePrefab = await LWManager.lwbundleManager.load<Prefab>(prefabName + '://' + prefabName, Prefab);
        if (!nodePrefab) {
            console.error("create new skill prefab error");
            return;
        }
        const node = instantiate(nodePrefab);
        node.parent = this.nodeSkill;
        node.name = 'skill_' + prefabName;

        let pos = null;

        if (skillConfig.skillPosType === SkillPosType.Circle || skillConfig.skillPosType === SkillPosType.Face) {
            pos = convertToNodeSpaceLWAR(v3(data.position.x, data.position.y, 0), this.nodeSkill);
        } else if (skillConfig.skillPosType === SkillPosType.ScreenPos) { //区域位置  location 1-5 offset 偏移量
            const location = skillConfig.location;
            const nodeLoc = this.nodeLocation[location - 1];
            const offSet: Array<number> = skillConfig.offSet;

            const wordPos = convertToWorldSpaceLWAR(nodeLoc);
            const curPos = convertToNodeSpaceLWAR(v3(wordPos.x, wordPos.y, 0), this.nodeSkill);
            pos = v3(curPos.x + offSet[0], curPos.y + offSet[1], 0);
        }
        node.getComponent<any>((data.SkillClass)).setCreatePos(v2(pos.x, pos.y));
    }

    async triggerWord() {
        const curWord = DataManager.dataSkill.curSkill;
        const propType = curWord[0];
        const curWordId = curWord[1];//当前触发的词条id
        const curOwnZi = curWord[2]; //触发这个词条后还剩的word字 并不是最新的数据 之后可能还有要触发的

        const wordDefine = SkillDefine.wordDefine[curWordId];
        const nodeLoc = this.nodeLocation[1];
        const wordPos = convertToWorldSpaceLWAR(nodeLoc);
        const pos = convertToNodeSpaceLWAR(v3(wordPos.x, wordPos.y, 0), this.nodeSkill); //飞行目标 坐标

        //词条栏 飞到 警戒线下方 展示 然后播放技能

        const wordConfig = DataManager.dataBattle.wordConfig[curWordId];
        const faceArray = wordConfig.faceArray;
        const chinese = wordConfig.chinese;

        const scrollWorldPos = convertToWorldSpaceLWAR(this.scrollView);
        const scrollPos = convertToNodeSpaceLWAR(scrollWorldPos, this.nodeSkill);//飞行起始坐标

        const startX = scrollPos.x - (faceArray.length / 2 - 0.5) * 100;
        const startY = scrollPos.y;

        const targetX = pos.x - (faceArray.length / 2 - 0.5) * 100;
        const targetY = pos.y;

        //这里来一个曝光 动画同时刷新词条栏

        console.log('======================scrollView===============2=============', curOwnZi);
        this.scrollView.getComponent(ScrollReuse).initView(curOwnZi, 5); //刷新最新词条栏
        this.bg_scroll.active = this.scrollView.getComponent(ScrollReuse).getData().length <= 6;

        //收集的词条可以凑出一个词条效果时自动触发灵光一闪的特效，同时屏幕逐渐变黑盖上黑幕，
        // 只有收集栏在黑幕上层(聚焦收集栏)。然后本次凑齐的几个词条icon按顺序依次飞到屏幕中间，
        // 依次变成文字，变的过程需要有特效，一个icon可能对应多个文字，全部变成文字后停留1秒，
        // 之后文字缩小消失，黑幕逐渐透明，再之后播凑齐的词条的具体动画
        this.maskAll.active = true;
        changeParent(this.scrollView, this.maskAll);

        this.collectSpines[0].active = true;
        this.collectSpines[0].getComponent(SuperSpine).playLwSpine('idle', false, () => {
            this.collectSpines[0].active = false;
        });

        //生成临时collect-face 飞到目标
        for (let i = 0; i < faceArray.length; i++) {
            const faceId = faceArray[i];
            const xx = startX + i * 100;
            const targetXX = targetX + i * 100;

            const nodeFace = instantiate(this.prefabCollectFace);
            nodeFace.parent = this.nodeSkill;
            nodeFace.setPosition(xx, startY);
            nodeFace.getComponent(CollectFace).setFaceInfo([faceId, 0]);
            // nodeFace.getComponent(CollectFace).addLizi(FacePerticleType.FaceFly);

            //飞上去展示
            const zi = chinese[i];
            tween(nodeFace).delay(1.0 + 0.5 * i).to(0.5, { position: v3(targetXX, targetY, 0) }).call(() => {
                nodeFace.getComponent(CollectFace).showSpine(() => {
                    //变化成汉字
                    nodeFace.getComponent(CollectFace).showWordZi(zi);
                });
            }).delay(3.0).to(0.3, { scale: v3(0, 0, 0) }).call(async () => {
                nodeFace.destroy(); //展示1秒 删除

                if (i === faceArray.length - 1) {
                    changeParent(this.scrollView, this.bottomNode.getChildByName('scroll'));
                    this.maskAll.active = false;

                    //展示词条对应的动作
                    const prefabName = wordDefine.prefab;
                    const nodePrefab = await LWManager.lwbundleManager.load<Prefab>(prefabName + '://' + prefabName, Prefab);
                    if (!nodePrefab) {
                        console.error("create new skill prefab error");
                        return;
                    }
                    const node = instantiate(nodePrefab);
                    node.parent = this.nodeSkill;
                    node.name = 'word_' + prefabName;

                    let pos = null;
                    if (wordConfig.skillPosType === SkillPosType.Circle || wordConfig.skillPosType === SkillPosType.Face) {
                        // pos = convertToNodeSpaceLWAR(v3(data.position.x, data.position.y, 0), this.nodeSkill);
                    } else if (wordConfig.skillPosType === SkillPosType.ScreenPos) { //区域位置  location 1-5 offset 偏移量
                        const location = wordConfig.location;
                        const nodeLoc = this.nodeLocation[location - 1];
                        const offSet: Array<number> = wordConfig.offSet;

                        const wordPos = convertToWorldSpaceLWAR(nodeLoc);
                        const curPos = convertToNodeSpaceLWAR(v3(wordPos.x, wordPos.y, 0), this.nodeSkill);
                        pos = v3(curPos.x + offSet[0], curPos.y + offSet[1], 0);
                    }

                    node.getComponent<any>((wordDefine.SkillClass)).setCreatePos(v2(pos.x, pos.y));
                }

            }).start()
        }
    }


    startCheckLose() {
        this.unschedule(this.checkLose);
        this.schedule(this.checkLose, 0.05, macro.REPEAT_FOREVER);
    }

    //准备发射的气泡变为彩虹
    changeFaceToAny(_type: number) {
        if (!this._curCircle) {
            return;
        }

        if (_type === 1) { //单色
            this._curCircle.getComponent(ModelCircle).clearFace();
            this._curCircle.getComponent(ModelCircle).createFace(anyCircleType, { [4001]: 3 });
        } else if (_type === 2 && this._curCircle.getComponent(ModelCircle).getCircleType() > 0) { //彩虹双色
            this._curCircle.getComponent(ModelCircle).clearFace();
            this._curCircle.getComponent(ModelCircle).createFace(anyCircleType, { [4001]: 3 });
            this._curCircle.getComponent(ModelCircle).createFace(1, { [1001]: 3 });
        }
    }

    //============================触摸事件==================================
    private addTouchEventListeners() {
        this.nodeTouch.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.nodeTouch.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.nodeTouch.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.nodeTouch.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        //test
        // systemEvent.on(SystemEvent.EventType.KEY_DOWN, (event: EventKeyboard) => {
        //     // DataManager.dataSkill.addSkillQueue([PropType.Word, 10001, []]);
        //     switch (event.keyCode) {
        //         case KeyCode.KEY_A:
        //             // this.changeFaceToAny(1);
        //             DataManager.dataSkill.addSkillQueue([PropType.Word, 10001, []]);;
        //             break;
        //         default:
        //             break;
        //     }
        // }, this);
    }

    _startX = 0;
    _touchTime = 0;

    wid = 0;
    onTouchStart(event: EventTouch) {
        // console.log("===onTouchStart===", event.getLocation().x);
        this._startX = event.getUILocation().x;
        this._touchTime = Date.now();

        if (this._curCircle && isValid(this._curCircle) && this._curCircle?.isValid) {
            this.wid = this._curCircle.getComponent(ModelCircle).getRadius() + 5; //+n 防止撞到两侧墙壁
        } else {

        }

        if (uiManager.isShow(UI_NAME.GuildPanel)) {
            uiManager.close(UI_NAME.GuildPanel);
        }

    }

    onTouchMove(event: EventTouch) {
        // console.log("===onTouchMove===", event.getLocation().x, event.getUILocation().x, event.getLocationInView().x);
        let xx = event.getUILocation().x;
        if (xx < this.wid) {
            xx = this.wid;
        }
        if (xx > view.getVisibleSize().width - this.wid) {
            xx = view.getVisibleSize().width - this.wid;
        }

        //在 技能和词条效果结束后才可以拖动气泡   在上方wait移动到ready位置时候不可点击
        if (this._canTouch && this._canFall && isValid(this._curCircle) && DataManager.dataSkill.status !== SkillStatus.Playing) {
            const posL = convertToNodeSpaceLWAR(v3(xx, 0, 0), this.nodeReadyCircle.parent);
            this.nodeReadyCircle.setPosition(posL.x, this.nodeReadyCircle.getPosition().y);
            this._curCircle.getComponent(ModelCircle).setState(CircleState.Move);
        }
    }

    onTouchEnd(event: EventTouch) {
        // console.log("===onTouchEnd===", event.getLocation().x)
        let xx = event.getUILocation().x;
        if (xx < this.wid) {
            xx = this.wid;
        }
        if (xx > view.getVisibleSize().width - this.wid) {
            xx = view.getVisibleSize().width - this.wid;
        }

        console.log('===_canFall==', this._canFall)
        if (this._canTouch && this._canFall && isValid(this._curCircle) && DataManager.dataSkill.status !== SkillStatus.Playing) {
            const posL = convertToNodeSpaceLWAR(v3(xx, 0, 0), this.nodeReadyCircle.parent);
            this.nodeReadyCircle.setPosition(posL.x, this.nodeReadyCircle.getPosition().y);
            const pos = convertToWorldSpaceLWAR(this._curCircle);
            const newPos = convertToNodeSpaceLWAR(pos, this.nodeBox);
            this._curCircle.parent = this.nodeBox;
            this._curCircle.setPosition(newPos.x, newPos.y);
            this._curCircle.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
            this.nodeReadyCircle.active = false;
            this._curCircle.getComponent(ModelCircle).shoot();
            this._curCircle.getComponent(ModelCircle).setState(CircleState.Shoot);
            this._curCircle.getComponent(CircleCollider2D).sensor = false;
            this._curCircle = null;

            this._shootCount = 0;

            this.nodeReadyCircle.children.forEach((node) => {
                if (node.name.indexOf('circle') >= 0) {
                    node.destroy();
                }
            })

        }
    }

    onTouchCancel(event: EventTouch) {
        // console.log("===onTouchCancel===", event.getLocation().x)
        let xx = event.getUILocation().x;
        if (xx < this.wid) {
            xx = this.wid;
        }
        if (xx > view.getVisibleSize().width - this.wid) {
            xx = view.getVisibleSize().width - this.wid;
        }
        if (this._canTouch && this._canFall && isValid(this._curCircle) && DataManager.dataSkill.status !== SkillStatus.Playing) {
            const posL = convertToNodeSpaceLWAR(v3(xx, 0, 0), this.nodeReadyCircle.parent);
            this.nodeReadyCircle.setPosition(posL.x, this.nodeReadyCircle.getPosition().y);
            const pos = convertToWorldSpaceLWAR(this._curCircle);
            const newPos = convertToNodeSpaceLWAR(pos, this.nodeBox);
            this._curCircle.parent = this.nodeBox;
            this._curCircle.setPosition(newPos.x, newPos.y);
            this._curCircle.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
            this.nodeReadyCircle.active = false;
            this._curCircle.getComponent(ModelCircle).shoot();
            this._curCircle.getComponent(ModelCircle).setState(CircleState.Shoot);
            this._curCircle.getComponent(CircleCollider2D).sensor = false;
            this._curCircle = null;
            this._shootCount = 0;

            this.nodeReadyCircle.children.forEach((node) => {
                if (node.name.indexOf('circle') >= 0) {
                    node.destroy();
                }
            })
        }

    }

    //=====================================初始化界面===========================================

    //初始化界面 先从上到下 再到上走一遍 然后 在生成小球
    async initStage() {
        if (DataManager.dataBattle.curStage > 1) {
            this.collectFaceAnim(true);
        }
        DataManager.dataBattle.initConfig();
        DataManager.dataBattle.setCollectFaceIds();
        DataManager.dataBattle.readyCircleFaceData = {};
        this.stopTouch.active = false;
        this.collectSpines.forEach((node) => {
            node.active = false;
        })

        const curStage = DataManager.dataBattle.curStage;

        this.nodeStage.removeAllChildren();
        this.nodeSkill.removeAllChildren(); //清空正在播放的技能

        const stageName = 'stage_' + curStage;
        const nodePrefab = await LWManager.lwbundleManager.load<Prefab>(stageName + '://stage', Prefab);
        if (nodePrefab) {
            const curNodeStage = instantiate(nodePrefab);
            curNodeStage.parent = this.nodeStage;
            curNodeStage.name = 'stage'
            //有一个从上到下 再到上的预览
            // tween(curNodeStage).start();

            if (this.nodeBox) {
                this.nodeBox.removeAllChildren();
                this.nodeBox = null;
            }
            this.nodeBox = curNodeStage.getChildByName('box');
            this.nodeBox.setSiblingIndex(100);
            DataManager.dataBattle.boxNode = this.nodeBox;


            //创建一个黑色遮罩
            const grayLayer = instantiate(this.nodeGrayLayer);
            grayLayer.parent = curNodeStage;
            grayLayer.setSiblingIndex(1);
            const viewSize = view.getVisibleSize();
            grayLayer.getComponent(UITransform).anchorY = 0.5;
            grayLayer.getComponent(UITransform).setContentSize(viewSize);
            grayLayer.active = false;

            this.nodeGrayLayer2 = grayLayer;
        }


        this.nodeReadyCircle.children.forEach((node) => {
            if (node.name.indexOf('circle') >= 0) {
                node.destroy();
            }
        })
        this.nodeWaitCircle.children.forEach((node) => {
            if (node.name.indexOf('circle') >= 0) {
                node.destroy();
            }
        })

        //当前关卡配置
        const curStageConfig = DataManager.dataBattle.stageConfig;
        DataManager.dataBattle.remainTime = curStageConfig.time;


        this.setDeadTime();

        //layout
        this.layoutCollect.removeAllChildren();

        for (let i = 0; i < DataManager.dataBattle.collectFaceIds.length; i++) {
            const faceId = DataManager.dataBattle.collectFaceIds[i];
            const collectFace = instantiate(this.prefabCollectFace);
            collectFace.getComponent(CollectFace).setFaceInfo([faceId, curStageConfig.collectFaceId[i]])
            collectFace.parent = this.layoutCollect;
        }

        DataManager.dataBattle.curLittleStage = 0;
        this.nextLittleStagePull();

        this.layoutCollect.getComponent(Layout).updateLayout(); //初始化收集区

        this.scrollView.getComponent(ScrollReuse).initView([], 5); //清空词条收集栏
        this.warnLine.getComponent(ModelLine).setNormalColor(); //警戒线设置正常颜色

        this.startCheckLose(); //开始检查气泡和警戒线交叉
        DataManager.dataBattle.warnLineY = convertToWorldSpaceLWAR(this.warnLine).y; //警戒线的世界坐标

        this.createWaitCircle(false); //创建新气泡
        this.createWaitCircle(true); //创建等待气泡

        //初始数据设置
        this._canFall = true;
        DataManager.dataSkill.init(); //技能初始化
        DataManager.dataSkill.setStatus(SkillStatus.None);

        this.battlePropCount = [0, 0, 0];


        this.battlProps.forEach((node, idx) => { //0 2  4
            node.getChildByName('icon').getComponent(Sprite).spriteFrame = this.battlPropFrame[idx * 2];
            node.getChildByName('add').active = true;
            node.getChildByName('num').active = true;
        })

    }

    //设置倒计时
    setDeadTime() {
        //初始化剩余时间
        this.labRemainTime.string = lwUtils.time.formatTime(DataManager.dataBattle.remainTime, CountdownTypeByLw['MM:ss']);
        this.labRemainTime.getComponent(TimerLabelByLw).startCountdownByLw(DataManager.dataBattle.remainTime, () => {
            this.failType = FailType.DeadLine;
            this.gameOver();
        }, async (countdown: number) => {
            const timeA = [180, 60];

            if (timeA.includes(countdown)) {
                const clockNode = this.labRemainTime.node.parent.getChildByName('clock');
                // ToastLw.showLwToast(`剩余${countdown / 60}分钟`);
                //闹钟抖动
                clockNode.getComponent(SuperSpine).playSpineLwWithLoop('rock', 'idle');

                const node = new Node();
                node.addComponent(UITransform);
                node.parent = this.labRemainTime.node.parent;
                node.setPosition(0, -170, 0);
                const sprite = node.addComponent(Sprite);

                const path = `battle://image/remain_${countdown / 60}_minite/spriteFrame`;
                const spriteFrame: SpriteFrame = await LWManager.lwbundleManager.load<SpriteFrame>(path, SpriteFrame);
                if (sprite?.node && sprite?.node.isValid) {
                    sprite.spriteFrame = spriteFrame;

                    node.setScale(0, 0, 1);
                    tween(node).to(0.4, { scale: v3(1.2, 1.2, 1) }).delay(0.6).to(0.4, { scale: v3(0, 0, 1) }).destroySelf().start();

                } else {
                    console.warn('=======闹钟node不在了==============')
                }

            }
        })
    }

    //根据配置创建默认的气泡 具体到小关卡
    async createDefaultCircle() {
        const curStage = DataManager.dataBattle.curStage;
        const curLittleStage = DataManager.dataBattle.curLittleStage;
        const initCircle = DataManager.dataBattle.stageConfig.initCircle;

        console.log("======createDefaultCircle====curLittleStage=========", curLittleStage)

        if (initCircle.length === 0 || initCircle[curLittleStage - 1].length === 0) {
            return;
        }

        initCircle[curLittleStage - 1].forEach(async (circleId: number) => {
            const circleConfig = DataManager.dataBattle.getStageCircle(circleId);

            const circle: Node = await this.createCircle(circleConfig.circleType - 1, this.nodeBox);
            console.log("======createDefaultCircle====position==2=======", circleConfig.position[1])
            circle.setPosition(circleConfig.position[0], circleConfig.position[1]);
            circle.getComponent(ModelCircle).setState(CircleState.Pool);
            //创建表情 初期是配置 后期是随机
            for (let i = 0; i < circleConfig.faceArray.length; i++) {
                const value = circleConfig.faceArray[i];
                const faceId = value[0];
                const faceCount = value[1];

                const faceType = Number(Config.Face[faceId].faceType);
                const faceInfo = { [faceId]: faceCount };
                circle.getComponent(ModelCircle).createFace(faceType, faceInfo);
            }
        })
    }

    //根据气泡类型创建气泡刚体
    async createCircle(idx: number, parentNode: Node) {
        const nodePrefab = await LWManager.lwbundleManager.load<Prefab>("model://circle", Prefab);
        if (!nodePrefab) {
            console.error("create new circle error");
            return;
        }
        const node = instantiate(nodePrefab);
        node.parent = parentNode;
        const circleSize = DataManager.dataBattle.circleSize[idx]; //气泡大小
        node.name = 'circle_' + circleSize;
        node.getComponent(ModelCircle).setCircleData(idx, {}); //设置气泡类型 以及表情的类型和数量
        node.getComponent(ModelCircle).setRadius(circleSize / 2); //设置气泡和刚体半径
        node.getComponent(ModelCircle).setRigidBodyType(ERigidBody2DType.Dynamic); //刚创建设置static类型

        return node;
    }

    async createWaitCircle(isWait: Boolean) {
        let parentNode = this.nodeWaitCircle;
        if (!isWait) {
            parentNode = this.nodeReadyCircle;
        }
        this.nodeReadyCircle.active = true;
        this.nodeWaitCircle.active = true;

        // const [circleType, data] = DataManager.dataBattle.getNewCircleData(); //随机获取一个新的data
        let info = null
        // if (DataManager.dataBattle.curStage === 1) {
        //     info = DataManager.dataBattle.getNewCircleData(); //随机获取一个新的data
        // } else {
        info = DataManager.dataBattle.getNewCircleData2(); //随机获取一个新的data
        // }
        const circleType: number = info[0];
        const data: any = info[1];
        const circle: Node = await this.createCircle(circleType, parentNode);
        circle.getComponent(ModelCircle).setRigidBodyType(ERigidBody2DType.Static); //刚创建设置static类型
        //faceType 是 属于哪个表情大类
        for (const faceType in data) {
            const faceInfo = data[faceType];
            circle.getComponent(ModelCircle).createFace(Number(faceType), faceInfo);
        }
        circle.getComponent(ModelCircle).setState(CircleState.Wait);
        circle.getComponent(CircleCollider2D).sensor = true; //刚创建的气泡设置为传感器

        if (isWait) {
            this._waitCircle = circle;
        } else {
            this._curCircle = circle;
        }

        return circle;
    }

    //等待状态移动到发射位置
    waitMoveReadyPos(callback) {
        //容错处理防止有2个准备发射的球
        this.nodeReadyCircle.children.forEach((node) => {
            if (node.name.indexOf('circle') >= 0) {
                node.destroy();
            }
        })

        this._canFall = false;
        console.log('==========waitMoveReadyPos==============', this._waitCircle)
        const pos = convertToWorldSpaceLWAR(this._waitCircle);
        const newPos = convertToNodeSpaceLWAR(pos, this.nodeReadyCircle);

        this.nodeReadyCircle.active = true;
        this._waitCircle.parent = this.nodeReadyCircle;

        this._waitCircle.setPosition(newPos.x, newPos.y);

        this._curCircle = this._waitCircle;
        this._waitCircle = null;
        tween(this._curCircle).to(0.1, { position: v3(0, 0, 0) }).call(() => {
            if (callback) {
                callback();
                callback = null;
            }
            this._canFall = true;
        }).start();

        this.nodeReadyCircle.setPosition(0, 410)
        this._curCircle.getComponent(ModelCircle).setState(CircleState.Ready);

        DataManager.dataBattle.readyCircleFaceData = this._curCircle.getComponent(ModelCircle).getFaceTypeData();
    }

    //发射位和等待位互换
    onClickWaitReadyLocChange() {
        if (!this._curCircle || !this._waitCircle) {
            return;
        }
        // console.log('==========change==============')
        this.nodeReadyCircle.active = true;
        this.nodeWaitCircle.active = true;

        const pos1 = convertToWorldSpaceLWAR(this._curCircle);
        const newPos1 = convertToNodeSpaceLWAR(pos1, this.nodeReadyCircle);

        const pos2 = convertToWorldSpaceLWAR(this._waitCircle);
        const newPos2 = convertToNodeSpaceLWAR(pos1, this.nodeWaitCircle);

        this._curCircle.parent = this.nodeWaitCircle;
        this._waitCircle.parent = this.nodeReadyCircle;

        this._curCircle.setPosition(newPos2.x, newPos2.y);
        this._waitCircle.setPosition(newPos1.x, newPos1.y);

        tween(this._curCircle).to(0.1, { position: v3(0, 0, 0) }).start();
        tween(this._waitCircle).to(0.1, { position: v3(0, 0, 0) }).start();

        this._curCircle.getComponent(ModelCircle).setState(CircleState.Wait);
        this._waitCircle.getComponent(ModelCircle).setState(CircleState.Ready);

        let temp = this._curCircle;
        this._curCircle = this._waitCircle;
        this._waitCircle = temp;
    }

    step() {
        console.log('=====fasdfasdf=')
    }

    checkLose() {
        if (this.nodeBox && this.warnLine.active) {
            let hadContact = null;
            for (let i = 0; i < this.nodeBox.children.length; i++) {
                const node = this.nodeBox.children[i];
                const pos = convertToWorldSpaceLWAR(node);

                const radius = node.getComponent(UITransform).contentSize.height / 2;
                const maxY = pos.y + radius;
                const linePos = convertToWorldSpaceLWAR(this.warnLine);

                if (maxY > linePos.y) {
                    hadContact = node;
                    break;
                }
            }

            if (hadContact && hadContact.getComponent(ModelCircle).getState() === CircleState.Pool) {
                this._loseCount++;
                if (this._loseCount > 2) { //防止误触 累计计数2次再算碰到
                    this.warnLine.getComponent(ModelLine).setContactColor();
                    this.warnLine.getComponent(ModelLine).setLabTime(Math.ceil(DataManager.dataBattle.warnLineTime - this._loseCount / 20));
                }
                console.log('===hadContact===', this._loseCount);
                if (this._loseCount >= DataManager.dataBattle.warnLineTime * 20) {
                    this.failType = FailType.WarnLine;
                    this.gameOver();
                    this.unschedule(this.checkLose);
                }
            } else {
                if (this._loseCount > 0) {
                    this.warnLine.getComponent(ModelLine).setNormalColor();
                    this._loseCount = 0;
                }
            }
        }
    }

    //=======================下一关推进===========================
    nextLittleStagePull() {
        DataManager.dataSkill.setStatus(SkillStatus.Stop); //技能暂停播放
        DataManager.dataBattle.curLittleStage++;
        console.log('=================nextLittleStagePull=======================', DataManager.dataBattle.curLittleStage);
        const curLittleStage = DataManager.dataBattle.curLittleStage;

        const nodeStage = this.nodeStage.getChildByName('stage');
        const nodeChain = nodeStage.getComponent(ModelStage).getUnderPinByIdx(curLittleStage - 1);
        nodeStage.getComponent(ModelStage).wakeUpBody(curLittleStage - 1);

        const warnLinePos = convertToWorldSpaceLWAR(this.warnLine); //下一个铰链的世界坐标
        const chainPos = convertToWorldSpaceLWAR(nodeChain); //下一个铰链的世界坐标
        const underPinPos = convertToWorldSpaceLWAR(this.underPinLine); //底座对准节点的世界坐标

        //找到当前池子气泡最高坐标位置
        let maxCircleY = chainPos.y; //防止没有任何气泡 默认设为下一小关底座 Y坐标
        for (let i = 0; i < this.nodeBox.children.length; i++) {
            const node = this.nodeBox.children[i];
            const pos = convertToWorldSpaceLWAR(node);
            const radius = node.getComponent(UITransform).contentSize.height / 2;
            const curY = pos.y + radius;
            if (curY > maxCircleY) {
                maxCircleY = curY;
            }
        }

        // let moveHeight = 0;
        // //当最高气泡顶部距离底座距离 < 600-200
        // console.log('====maxCircleYmaxCircleY==', maxCircleY, chainPos.y);
        // const distance = DataManager.dataBattle.warnlineUnderPinDistance - DataManager.dataBattle.warnLineDistance
        // if (maxCircleY - chainPos.y > distance) {
        //     //stage上升到 距离警戒线200位置
        //     moveHeight = warnLinePos.y - DataManager.dataBattle.warnLineDistance - maxCircleY;
        //     console.log('=======move===full==11111====', moveHeight);
        // } else {
        //     moveHeight = underPinPos.y - chainPos.y;
        //     console.log('=========move==notFull====222222============', moveHeight);
        // }

        const moveHeight = underPinPos.y - chainPos.y;
        let time = 0.8;
        let moveTime = 1.3;
        if (DataManager.dataBattle.curLittleStage === 1) {
            time = 0;
            moveTime = 0; //第一小关直接设置坐标
        }

        this.warnLine.active = false;
        if (DataManager.dataBattle.curLittleStage > 1) {
            this._canFall = false;
        }

        this.nextSpine.active = DataManager.dataBattle.curLittleStage > 1;
        if (DataManager.dataBattle.curLittleStage > 1) {
            this.nextSpine.getComponent(SuperSpine).playLwSpine('idle', true);
        }
        tween(nodeStage).delay(time).call(() => {
            this.createDefaultCircle(); //创建默认气泡
        }).by(moveTime, { position: v3(0, moveHeight, 0) }).call(() => {
            if (DataManager.dataBattle.curLittleStage > 1) {
                this.nextSpine.active = false; //spine停止
            }
        }).delay(0.6).call(() => {
            // 第二关开始 超过警戒线内200像素的 销毁 (词条收集  收集的face和技能不触发)
            if (DataManager.dataBattle.curLittleStage > 1) {
                this.checkWarnCircleBoom();
                this._canFall = true;
            }
            this.warnLine.active = true;
            DataManager.dataSkill.setStatus(SkillStatus.None);
            DataManager.dataSkill.nextSkillTrigger();
        }).start();

        DataManager.dataBattle.updateFaceTypeClone();
    }

    checkWarnCircleBoom() {
        let hadCircleBoom = false;
        const warnLinePosY = convertToWorldSpaceLWAR(this.warnLine).y;
        for (let i = 0; i < this.nodeBox.children.length; i++) {
            const circleNode = this.nodeBox.children[i];
            if (circleNode.getComponent(ModelCircle).stillExist() && circleNode.getComponent(ModelCircle).getState() === CircleState.Pool) {
                const wordPos = convertToWorldSpaceLWAR(circleNode);
                if (warnLinePosY - wordPos.y < DataManager.dataBattle.warnLineDistance) {
                    circleNode.getComponent(ModelCircle).destorySelf(true, true);
                    hadCircleBoom = true;
                }
            }
        }

        if (hadCircleBoom) {
            this._canTouch = false; //屏蔽触摸
            this.scheduleOnce(() => {
                this._canTouch = true;
            }, 1.0);
        }


    }

    // 1随机触发一种词条表情效果
    // 2 将所有泡泡内颜色打乱
    // 3 消除一个指定泡泡
    onClickProp(event, data: string) {
        if (DataManager.dataSkill.status !== SkillStatus.None) {
            return;
        }

        const idx = Number(data);
        if (this.battlePropCount[idx] === 0) {
            uiManager.show(UI_NAME.BattleUseProp, Number(data))
        } else if (this.battlePropCount[idx] === 1) { //使用
            this.useBattleProp(idx);
        } else if (this.battlePropCount[idx] === 2) {

        }

    }

    //使用道具
    useBattleProp(idx) {
        idx = Number(idx);


        let count = 0;
        for (let i = 0; i < this.nodeBox.children.length; i++) {
            if (this.nodeBox.children[i].getComponent(ModelCircle).stillExist()) {
                count++;
                break;
            }
        }

        if (count === 0) {
            ToastLw.showLwToast('暂无气泡可使用道具');
            return;
        }

        switch (idx) {
            case 0:
                this.touchOneDestory();
                break;
            case 1:
                this.randomDelOneCorlor();
                break;
            case 2:
                this.derangeCircle();
                break;
            default:
                break;
        }

        this.battlePropCount[idx] = 2;

        this.battlProps[idx].getChildByName('icon').getComponent(Sprite).spriteFrame = this.battlPropFrame[idx * 2 + 1]
        this.battlProps[idx].getChildByName('add').active = false;
        this.battlProps[idx].getChildByName('num').active = false;
    }

    //获得道具
    getBattleProp(idx) {
        this.battlePropCount[idx] = 1;

        this.battlProps[idx].getChildByName('add').active = false;
        this.battlProps[idx].getChildByName('num').active = true;
    }

    randomDelOneCorlor() {
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

        console.log('==========randomDelOneCorlor========facetype=======', selectFaceType)

        for (let i = 0; i < DataManager.dataBattle.boxNode.children.length; i++) {
            const nodeCircle = DataManager.dataBattle.boxNode.children[i];
            const modelCircle = nodeCircle.getComponent(ModelCircle);
            if (modelCircle.stillExist() && modelCircle.getState() === CircleState.Pool) {

                const faceTypeData = lwUtils.utils.deepClone(modelCircle.getFaceTypeData());
                for (const faceType in faceTypeData) {
                    if (Number(faceType) === selectFaceType) {
                        if (modelCircle.getCircleKindType() === CircleKindType.OneColor) {
                            modelCircle.destorySelf(true);
                        } else if (modelCircle.getCircleKindType() === CircleKindType.TwoColor) {
                            modelCircle.destoryFaceType(selectFaceType);
                        }

                    }
                }
            }
        }


    }

    // triggerRandomSKill() {
    //     const idx = getRandomInt(0, Object.keys(DataManager.dataBattle.wordConfig).length - 1);
    //     const wordId = Object.values(DataManager.dataBattle.wordConfig)[idx].wordId;
    //     DataManager.dataSkill.addSkillQueue([PropType.Word, wordId, Array.from(DataManager.dataSkill.ownWordZi)]);
    // }

    touchOneDestory() {
        this.nodeGrayLayer.active = true;
        this.nodeGrayLayer2.active = true;
        this.lwDispatchEmit(UI_LW_EVENT_NAME.CIRCLE_TOUCH_DESTORY, true);

        this.labRemainTime.getComponent(TimerLabelByLw).pauseLwCountDown();
    }

    //打乱泡泡内颜色
    derangeCircle() {
        DataManager.dataBattle.distorbCircle();
    }

    async onClickBack() {
        gotoLWScene('home', false);
    }

    //下一个准备发射
    newCircleReady() {
        this._shootCount = -1;
        //等待的气泡移动到发射位
        eventAfterPhysics(() => {
            this.waitMoveReadyPos(() => {
                this.createWaitCircle(true); //创建一个新的等待位的气泡
            });
        })

        if (this.nodeGrayLayer.active) {
            this.lwDispatchEmit(UI_LW_EVENT_NAME.CIRCLE_TOUCH_DESTORY, true);
        }
    }
    update(deltaTime: number) {
        if (this._shootCount >= 0) {
            this._shootCount += deltaTime;
            // console.log('======_shootCount=========', this._shootCount)
            if (this._shootCount >= 3) { //N秒还没有落地则重置
                this.lwDispatchEmit(UI_LW_EVENT_NAME.CIRCLE_FIRST_CONTACT);
            }
        }
    }

    onDestroy(): void {
        super.onDestroy();
        DataManager.dataBattle.boxNode = null;
        DataManager.dataSkill.clear()
    }

    gameOver() {
        this.pauseGame();
        uiManager.show(UI_NAME.GameRevivePanel, this.failType);
    }

    gameSuccess() {
        this.pauseGame();
        uiManager.show(UI_NAME.GameSuccessPanel);
    }

    pauseGame() {
        // director.pause();
        this.labRemainTime.getComponent(TimerLabelByLw).pauseLwCountDown();
        this.stopTouch.active = true;
    }

    resumeGame() {
        // director.resume();
        this.labRemainTime.getComponent(TimerLabelByLw).resumeLwCountDown();
        this.stopTouch.active = false;
    }

    //游戏结束要设置的量
    setGameClear() {
        this.unschedule(this.checkLose); //停止警戒线计算
        DataManager.dataSkill.curSkill = null; //技能列表清空
        DataManager.dataSkill.skillQueue = [];
        DataManager.dataSkill.setStatus(SkillStatus.Stop);
        this._canFall = false;

        DataManager.dataSkill.ownWordZi.clear();
        this.scrollView.getComponent(ScrollReuse).initView([], 5);
        this.nodeSkill.removeAllChildren();

        this.nodeBox.children.forEach((node) => {
            Tween.stopAllByTarget(node);
        })
        eventAfterPhysics(() => {
            this.nodeBox.removeAllChildren();
        })

        this.nodeGrayLayer.active = false;
        this.nodeGrayLayer2.active = false;

        this.labRemainTime.getComponent(TimerLabelByLw).stopCountdownByLw();
    }

    gameEndNext(nextStage) {
        if (nextStage === BATTLE_END_NEXT_OPERATION.BACKHOME) {
            this.setGameClear();
            this.onClickBack();
        } else if (nextStage === BATTLE_END_NEXT_OPERATION.REVIVE) {
            //两种复活 一种是时间到（加时间） 一种是警戒线 （200以内泡泡消除）
            this.resumeGame(); //继续游戏
            this.startCheckLose(); //开始检查警戒线

            if (this.failType === FailType.DeadLine) {
                const reviveGiveTime = Number(getGlobalCfgValue('reviveGiveTime'));
                DataManager.dataBattle.remainTime = reviveGiveTime;
                this.setDeadTime();
            } else if (this.failType === FailType.WarnLine) {
                this.checkWarnCircleBoom();
            }
            this.failType = FailType.None;

        } else if (nextStage === BATTLE_END_NEXT_OPERATION.NEXTSTAGE) {
            this.setGameClear();
            if (nextStage) {
                DataManager.dataBattle.curStage++;
                DataManager.dataBattle.curLittleStage = 1;

                if (DataManager.dataBattle.curStage > 2) {
                    ToastLw.showLwToast('恭喜你 已通关');
                    this.onClickBack();
                    return;
                }
            }
            this.initStage();
        }
    }

    changeFaceToCaihong() {
        if (!this._curCircle) {
            return;
        }
        const modelCircle = this._curCircle.getComponent(ModelCircle);
        const faceTypeData = lwUtils.utils.deepClone(modelCircle.getFaceTypeData());
        modelCircle.setCircleAnim(CircleAnimType.Spine);

        for (const faceType in faceTypeData) {
            modelCircle.delFace(Number(faceType), null, false);
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
        }

    }

    onClickHelp() {
        uiManager.show(UI_NAME.HelpPanel);
    }

    onClickSet() {
        uiManager.show(UI_NAME.SetPanel);
    }
}

