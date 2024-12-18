import { SuperData } from './super-data';
import { CircleState, DATA_LW_NAME, REWARD_STATUS } from '../constant/lw-common-define';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { Node } from 'cc';
import { v3 } from 'cc';
import RandomLW, { WeightMsg } from '../../frame/center/lw_utils/tool';
import { getGlobalCfgValue, getRandomInt } from '../common';
import { DataManager } from './data-manager';
import { ModelCircle } from '../../model/model-circle';
import { convertToNodeSpaceLWAR, convertToWorldSpaceLWAR } from '../ui-commonset';
import { FaceKindType, ModelFace } from '../../model/model-face';
import { tween } from 'cc';
import { CircleCollider2D } from 'cc';


export enum BATTLE_END_NEXT_OPERATION {
    None = 0,
    NEXTSTAGE = 1,
    BACKHOME = 2,
    REVIVE = 3, //复活
}

// 战斗类型
export enum BATTLE_STAGE_TYPE {
    MAIN,
}

export class DataBattle extends SuperData {
    name = DATA_LW_NAME.BATTLE_DATA;
    // ---------  数据逻辑处理   ------------------
    netMessageHanders = {

    };

    boxNode: Node = null; //存放所有气泡的父节点
    //关卡数据
    curStage: number = 1;
    curLittleStage: number = 1;
    remainTime: number = 0; //剩余倒计时

    createFaceType = [];
    collectFaceIds = []; //要收集的faceId
    hadCollectFull = [0, 0, 0, 0];  //已经收集的表情具体数量
    collectFaceType = []; //收集face的颜色大类

    underPinLocY = 0; //底座位置Y
    warnLineY = 0; //警戒线的世界坐标Y
    allCircleData = {}; //本关所有气泡信息
    faceTypeClone = {};
    //基础配置
    circleMaxFaceCount = null; //气泡容纳数量 超过此数量爆炸
    circleSize = null; //气泡大小 直径
    faceSize = null; //表情大小 直径
    faceTypeArray: Array<number> = [];  //当前关卡表情大类 
    faceTypeConfig = null; //表情大类配置
    faceConfig: { [id: number]: Face } = null; //face配置
    wordConfig: { [id: number]: Word } = null;//词条配置
    stageConfig: Stage = null; //所有关卡配置
    warnlineUnderPinDistance = null;//警戒线距离底高度
    warnLineDistance = null; //距离警戒线的高度
    allWordFaceIdArray: Array<number> = [];
    warnLineTime: number = 0;

    readyCircleFaceData = {}; //准备气泡的face数据

    initConfig() {
        this.circleMaxFaceCount = getGlobalCfgValue('circleMaxFaceCount');
        this.circleSize = getGlobalCfgValue('circleSize');
        this.faceSize = getGlobalCfgValue('faceSize');
        this.warnlineUnderPinDistance = getGlobalCfgValue('warnlineUnderPinDistance');  //680
        this.warnLineDistance = getGlobalCfgValue('warnLineDistance');  //200
        this.warnLineTime = Number(getGlobalCfgValue('warnLineTime'))

        this.faceTypeConfig = Config.FaceType;
        this.faceConfig = Config.Face;
        this.wordConfig = Config.Word;


        if (this.curStage === 1) {
            this.stageConfig = Config.Stage[1];
            return;
        }

        const stageIds = Config.StageCount[this.curStage].stageIds;

        let loseCount = lwUtils.storage.getItem('game_lose_count');
        if (loseCount) {
            loseCount = Number(loseCount);
        } else {
            loseCount = 0;
        }

        const stageDifficulty = Config.StageDifficulty[loseCount];

        let arr1: Array<WeightMsg> = [];
        stageDifficulty.weight.forEach((weight, idx) => {
            arr1.push({ id: idx, weight: weight })
        })
        const idx: number = RandomLW.randByWeight(arr1); //困难 正常 简单

        for (const key in Config.Stage) {
            const stageInfo = Config.Stage[key];
            if (stageIds.includes(stageInfo.id) && stageInfo.difficultLv === idx + 1) {
                this.stageConfig = stageInfo;
                break;
            }
        }
        console.log('=======this.stageConfig============', this.stageConfig);

    }

    checkCollectFull() {
        const curStageConfig: Stage = DataManager.dataBattle.stageConfig;
        for (let i = 0; i < this.hadCollectFull.length; i++) {
            if (this.hadCollectFull[i] < curStageConfig.collectFaceId[i]) {
                return false;
            }
        }
        return true;
    }

    getStageCircle(id: number) {
        const config = Config.StageCircle[id];
        if (!config) {
            console.error('error  getStageCircle:', id);
        }
        return config;
    }



    //打乱气泡内表情
    distorbCircle() {
        const circles = [];
        DataManager.dataBattle.boxNode.children.forEach((circleNode) => {
            if (circleNode.getComponent(ModelCircle).stillExist() && circleNode.getComponent(ModelCircle).getState() === CircleState.Pool) {
                circles.push(circleNode);
            }
        })
        // //气泡按照从大到小排序
        // circles.sort((a, b) => {
        //     return b.getComponent(ModelCircle).getRadius() - a.getComponent(ModelCircle).getRadius();
        //     // return convertToWorldSpaceLWAR(a).x - convertToWorldSpaceLWAR(b).x
        // })

        // let faceAll = {};
        let allFaceNode = [];
        let circleTypeArray = [];
        let circleColors = [];

        let faceAllArray = [];
        console.log('=====================distorbCircle==========start=========11111111======================')
        for (let i = 0; i < circles.length; i++) {
            const circleNode = circles[i];
            const modelCircle: ModelCircle = circleNode.getComponent(ModelCircle);

            modelCircle.faceParent.children.forEach((faceNode) => {
                allFaceNode.push(faceNode);
            })

            const faceInfo = modelCircle.getFaceTypeData();
            console.log(convertToWorldSpaceLWAR(circleNode).x, '======distorbCircle======000=====', JSON.stringify(faceInfo))

            for (const faceType in faceInfo) {
                faceAllArray.push([Number(faceType), faceInfo[faceType]]);
            }

            circleTypeArray.push(modelCircle.getCircleType());
            circleColors.push(modelCircle.getCircleKindType())
        }

        console.log('======distorbCircle===========乱序前的color=========', circleColors);

        //把颜色种类乱序  
        circleColors = lwUtils.array.shuffle(circleColors);
        circleColors = lwUtils.array.shuffle(circleColors);
        circleColors = lwUtils.array.shuffle(circleColors);
        for (let i = 0; i < circleTypeArray.length; i++) {
            const circleType = circleTypeArray[i];
            const circleMaxCount = DataManager.dataBattle.circleMaxFaceCount[circleType];
            if (circleMaxCount === 1 && circleColors[i] === 2) { //遇到了最小气泡 但是颜色有2种
                circleColors[i] = 1;

                for (let k = 0; k < circleColors.length; k++) {
                    const circleType = circleTypeArray[k];
                    const circleMaxCount = DataManager.dataBattle.circleMaxFaceCount[circleType];
                    if (circleColors[k] === 1 && circleMaxCount > 1) {
                        circleColors[k] = 2;
                        break;
                    }
                }
            }
        }

        console.log("======distorbCircle====乱序后的color===============", circleColors, JSON.stringify(faceAllArray));

        //移动表情
        for (let i = 0; i < circles.length; i++) {
            const circleNode = circles[i];
            console.log(convertToWorldSpaceLWAR(circleNode).x, "======distorbCircle===开始获得新face=====1======");

            const modelCircle: ModelCircle = circleNode.getComponent(ModelCircle);
            modelCircle.resetFaceInfo();

            let aaaaa = [];
            for (let k = 0; k < circleColors[i]; k++) {
                const idx = getRandomInt(0, faceAllArray.length - 1);
                const faceArrayNew = faceAllArray[idx];  //{"1201":3,"1202":3},
                faceAllArray.splice(idx, 1); //当前颜色大类包含的 faceId和数量 Array

                aaaaa.push(faceArrayNew);
                const faceType = faceArrayNew[0];
                const faceArray = faceArrayNew[1]
                for (const key in faceArray) {
                    const faceId = Number(key);
                    const needCount = Number(faceArray[key]);
                    // const faceConfig = DataManager.dataBattle.faceConfig[faceId];
                    modelCircle.addFaceInfo(faceType, { [faceId]: needCount });
                    //开始移动
                    let count = 0;
                    for (let j = allFaceNode.length - 1; j >= 0; j--) {
                        const faceNode = allFaceNode[j];
                        if (faceNode.getComponent(ModelFace).getFaceId() === Number(faceId)) {
                            allFaceNode.splice(j, 1);

                            (faceNode as any).compoent.destroy(); //先删除DistanceJoint2D组件
                            const pos = convertToWorldSpaceLWAR(faceNode);
                            const newPos = convertToNodeSpaceLWAR(pos, circleNode);
                            faceNode.parent = circleNode.getChildByName('faceParent'); //一定要把face节点放到 对方的faceParent节点下
                            faceNode.setPosition(newPos.x, newPos.y);

                            faceNode.getComponent(CircleCollider2D).sensor = true;
                            faceNode.getComponent(CircleCollider2D).apply();

                            tween(faceNode).to(0.3, { position: v3(0, 0, 0) }).call(() => {
                                modelCircle.addFaceOnly(faceNode, count === needCount); //加到对方气泡上（数据已经先加了）
                            }).start();
                            count++;
                            if (count === needCount) {
                                break;
                            }
                        }
                    }
                }
            }
            console.log(convertToWorldSpaceLWAR(circleNode).x, '==distorbCircle==获得新表情====2=======', JSON.stringify(aaaaa));
        }
        if (faceAllArray.length > 0) {
            console.error('=====distorbCircle=====没有分配干净======');
        }

        DataManager.dataBattle.boxNode.children.forEach((circleNode) => {
            if (circleNode.getComponent(ModelCircle).stillExist() && circleNode.getComponent(ModelCircle).getState() === CircleState.Pool) {
                circleNode.getComponent(ModelCircle).transfromColorOperation(2);
            }
        })

        console.log('==========distorbCircle======================end================', JSON.stringify(faceAllArray));
    }
    //创建新气泡的数据 遍历data 判定  以后这里会非常复杂 要遍历整个气泡
    //[气泡类型,{大类id : {faceId:count,faceId:count}}]
    // getNewCircleData() {
    //     let collectFaceId = [];
    //     this.stageConfig.collectFaceId.forEach((collectFace) => {
    //         collectFaceId.push(collectFace[0]);
    //     })
    //     //创建气泡中表情的类型和数量
    //     let createData: { [id: string]: {} } = {};

    //     let faceTypeCount = getRandomInt(1, 2); //随机出一个或两个表情

    //     let idx = getRandomInt(0, this.circleSize.length - 1) //第几个气泡

    //     let maxSize = this.circleMaxFaceCount[idx]; //最多几个数量
    //     if (maxSize === 1) { //只能容纳一个表情
    //         faceTypeCount = 1;
    //     }

    //     let faceTypeArray = lwUtils.utils.deepClone(this.faceTypeArray); //深拷贝一份 防止篡改

    //     for (let i = 0; i < faceTypeCount; i++) { //每一个随机出数量
    //         let faceTypeIdx = getRandomInt(0, faceTypeArray.length - 1);
    //         const curFaceType = faceTypeArray[faceTypeIdx]; //选中一个表情大类
    //         faceTypeArray.slice(faceTypeIdx, 1);

    //         const randomCount = Math.floor(maxSize / faceTypeCount);
    //         let count = getRandomInt(1, randomCount);

    //         const faceIdArray = this.faceTypeConfig[curFaceType].simplefaceIdArray;

    //         const idx = getRandomInt(0, faceIdArray.length - 1);
    //         const faceId = faceIdArray[idx];
    //         createData[curFaceType + ''] = { [faceId]: count }; //第一关 一个颜色大类只生成一种faceId
    //         // const wightArray = this.faceTypeConfig[curFaceType].weight;
    //         // let arr: Array<WeightMsg> = [];
    //         // faceIdArray.forEach((faceId, idx) => {
    //         //     arr.push({ id: faceId, weight: wightArray[idx] })
    //         // })

    //         // let faceInfo = {}; //随机出的face 
    //         // for (let i = 0; i < count; i++) {
    //         //     const idx = RandomLW.randByWeight(arr);
    //         //     if (faceInfo[arr[idx].id]) {
    //         //         faceInfo[arr[idx].id]++;
    //         //     } else {
    //         //         faceInfo[arr[idx].id] = 1;
    //         //     }
    //         // }
    //         // createData[curFaceType + ''] = faceInfo;
    //     }

    //     return [idx, createData];

    // }


    //第一小关和>=5小关更新 
    updateFaceTypeClone() {
        if (this.curLittleStage !== 1 && this.curLittleStage < Number(getGlobalCfgValue('littleStageCreateMoreColor'))) {
            return;
        }

        this.faceTypeArray = this.stageConfig.circleType;
        let collectFaceId = this.collectFaceIds;

        //确定是哪两种颜色
        const collectFaceArray = this.stageConfig.collectFaceId; //收集的face的数量
        let collectFace = collectFaceId;                        //要收集的faceId

        //根据上面的每个收集的face 踢出不能出现的颜色
        // let collectConfig = [1, 3, 5, 8]; //从第几关开始出现第几个收集的id

        let collectConfig = getGlobalCfgValue('targetFacesShowUp');

        const lastNeedCollect = collectFaceArray[collectFaceArray.length - 1] //最后一个face需要收集的数量
        const lastHadCollect = this.hadCollectFull[this.hadCollectFull.length - 1] //最后一个face已经收集的数量
        if (this.curLittleStage >= 8 && this.curLittleStage <= 9 && lastHadCollect >= lastNeedCollect * Number(getGlobalCfgValue('mainFaceCollectLImit')) / 100) {
            collectConfig[3] = 999;
        }

        if (this.curStage === 1) { //第一关不限制收集face的出现关卡
            collectConfig = [1, 1, 1, 1];
        }

        let faceTypeClone: { [id: number]: any } = {}
        for (const id in Config.FaceType) {
            if (this.faceTypeArray.includes(Number(id))) {
                faceTypeClone[id] = lwUtils.utils.deepClone(Config.FaceType[id]);
            }
        }

        for (const id in faceTypeClone) {
            const value: FaceType = faceTypeClone[id];
            const simplefaceIdArray = value.simplefaceIdArray; //本颜色大类的只有纯颜色表情（除去技能 词条的faceid）

            for (let i = simplefaceIdArray.length - 1; i >= 0; i--) {
                const faceId = simplefaceIdArray[i];
                if (collectFace.includes(faceId)) {
                    const collectIdx = collectFace.indexOf(faceId); //收集栏第几个
                    if (this.curLittleStage < collectConfig[collectIdx]) { //当前小关卡比
                        simplefaceIdArray.splice(i, 1); //踢出收集的faceId
                        console.log('====getNewCircleData2=====踢出收集的faceId==', faceId);
                        if (simplefaceIdArray.length === 0) {
                            console.log('====getNewCircleData2=====踢出收集的faceType==', id);
                            delete faceTypeClone[id];
                        }
                    }
                }
            }
        }
        console.log('====getNewCircleData2=====踢出本小关不出现的faceId后==', faceTypeClone);

        if (this.curLittleStage < Number(getGlobalCfgValue('littleStageCreateMoreColor'))) {
            for (const id in faceTypeClone) {
                const curSimpleIdArray = lwUtils.utils.deepClone(faceTypeClone[id].simplefaceIdArray);

                let contain = false;
                for (let i = 0; i < collectFaceId.length; i++) {
                    if (curSimpleIdArray.includes(collectFaceId[i])) {
                        contain = true;
                        break;
                    }
                }
                if (this.faceTypeArray.includes(Number(id)) && contain) {
                    const idx = this.collectFaceType.indexOf(Number(id));
                    faceTypeClone[id].simplefaceIdArray = [collectFaceId[idx]];
                } else {
                    const idx = getRandomInt(0, curSimpleIdArray.length - 1);
                    const faceId = curSimpleIdArray[idx];
                    faceTypeClone[id].simplefaceIdArray = [faceId];
                }
            }
        }
        console.log(this.curLittleStage, '====getNewCircleData2====小于5小关的强制展示的==', JSON.stringify(faceTypeClone));


        this.faceTypeClone = faceTypeClone;
    }

    //第二关 生成新气泡
    getNewCircleData2() {
        const faceTypeClone = lwUtils.utils.deepClone(this.faceTypeClone);

        let collectFaceId = this.collectFaceIds;
        this.faceTypeArray = this.stageConfig.circleType;

        const curDifficultId = this.stageConfig.difficultId;
        console.log('====getNewCircleData2=======curDifficultId===', curDifficultId);
        const difficultConfig = Config.Difficult[curDifficultId[this.curLittleStage - 1]];
        const circleSizeWeight = difficultConfig.circleSizeWeight; //"气泡大小权重 小|中|大|超大"

        let arr1: Array<WeightMsg> = [];
        circleSizeWeight.forEach((weight, idx) => {
            arr1.push({ id: idx, weight: weight })
        })
        const circleType: number = RandomLW.randByWeight(arr1); //得到气泡类型 0 1 2 3

        console.log('====getNewCircleData2=======circleType===', circleType);

        const circleColorProbability = difficultConfig.circleColorProbability[circleType] //"气泡双色概率小|中|大|超大"
        let colorCount = 1; //这个气泡有几种(1/2)颜色 默认1个
        const random = Math.random();
        // console.log('====getNewCircleData2=======random===', random);
        if (circleColorProbability > 0 && random < circleColorProbability) {
            colorCount = 2; //2种颜色
        }

        if (this.circleMaxFaceCount[circleType] === 1) { //最小气泡只能有一个表情
            colorCount = 1;
        }

        console.log('====getNewCircleData2=======colorCount===', colorCount);
        let createData: { [id: string]: {} } = {}; //颜色大类对应的 faceId:count

        const faceKindKey = "circleFaceKindWeightByCircleType" + (circleType + 1);
        const weightArray = difficultConfig[faceKindKey];

        console.log('=======getNewCircleData2======weight======', weightArray);

        let skillCount = this.getSkillWordCount(FaceKindType.SkillFace);
        if (skillCount > difficultConfig.curInBattleItemFaceModify.length - 1) {
            skillCount = difficultConfig.curInBattleItemFaceModify.length - 1;
        }

        const skillWeight = weightArray[1] * difficultConfig.curInBattleItemFaceModify[skillCount];
        weightArray[0] += weightArray[1] - skillWeight;
        weightArray[1] = skillWeight;

        let wordCount = this.getSkillWordCount(FaceKindType.WordFace);
        if (wordCount > difficultConfig.curInBattleWordFaceModify.length - 1) {
            wordCount = difficultConfig.curInBattleWordFaceModify.length - 1;
        }
        const wordWeight = weightArray[2] * difficultConfig.curInBattleWordFaceModify[wordCount];
        weightArray[0] += weightArray[2] - wordWeight;
        weightArray[2] = wordWeight;

        console.log('=======getNewCircleData2=======curWeight======', weightArray);

        let arr2: Array<WeightMsg> = [];
        weightArray.forEach((weight, idx) => {
            arr2.push({ id: idx, weight: Math.round(weight) }) //weight 四舍五入
        })
        let circleKind = RandomLW.randByWeight(arr2); //0 1 2 氛围表情|道具表情|词条表情
        console.log('====getNewCircleData2=======circleKind=氛围表情|道具表情|词条表情==', collectFaceId, circleKind);

        if (this.curStage === 1 && circleKind === 2) { //第一大关
            circleKind = 0;
        }

        // if (this.curStage > 1) {
        // circleKind = 1;  //test
        // }

        let selectFaceType = null;
        if (circleKind === 0) { //普通face
            const faceTypeIdx = getRandomInt(0, Object.keys(faceTypeClone).length - 1);
            const value: any = Object.values(faceTypeClone)[faceTypeIdx];
            selectFaceType = value.id; //颜色大类确

            const simplefaceIdArray = value.simplefaceIdArray; //纯氛围表情 无道具无词条
            const idx = getRandomInt(0, simplefaceIdArray.length - 1);
            const faceId = simplefaceIdArray[idx];
            createData[selectFaceType] = { [faceId]: 1 };
            console.log('====getNewCircleData2=====氛围表情首选==', selectFaceType, faceId);

        } if (circleKind === 1) { //道具 
            let idx = getRandomInt(0, Object.keys(Config.Skill).length - 1);
            const value: Skill = Object.values(Config.Skill)[idx];

            const idx2 = getRandomInt(0, Object.keys(faceTypeClone).length - 1);
            selectFaceType = Number(Object.keys(faceTypeClone)[idx2])
            const faceId = value.faceIds[selectFaceType - 1];
            createData[selectFaceType] = { [faceId]: 1 };
            console.log('====getNewCircleData2=====道具表情首选==', selectFaceType, faceId);

            // const faceTypeCloneKey = Object.keys(faceTypeClone);
            // let allSkill = [];
            // for (const id in Config.Skill) {
            //     const skillValue = Config.Skill[id];

            //     const faceIdx = getRandomInt(0, skillValue.faceIds.length - 1);
            //     const faceId = skillValue.faceIds[faceIdx];
            //     const faceConfig = Config.Face[faceId];
            //     const faceType = faceConfig.faceType;
            //     if (faceTypeCloneKey.includes(faceType + '')) {
            //         allSkill.push(skillValue);
            //     }
            // }
            // console.log('====getNewCircleData2=====道具表情 适合的==', allSkill);
            // if (allSkill.length > 0) {
            //     const skillIdx = getRandomInt(0, allSkill.length - 1);
            //     const skillConfig: Skill = allSkill[skillIdx];
            //     const faceId = skillConfig.faceId;
            //     const faceConfig = Config.Face[faceId];
            //     selectFaceType = faceConfig.faceType; //颜色大类确定
            //     createData[selectFaceType] = { [faceId]: 1 };
            //     console.log('====getNewCircleData2=====道具表情首选==', selectFaceType, faceId);
            // } else {
            //     const faceTypeIdx = getRandomInt(0, Object.keys(faceTypeClone).length - 1);
            //     const value: FaceType = Object.values(faceTypeClone)[faceTypeIdx];
            //     selectFaceType = value.id; //颜色大类确

            //     const simplefaceIdArray = value.simplefaceIdArray; //纯氛围表情 无道具无词条
            //     const idx = getRandomInt(0, simplefaceIdArray.length - 1);
            //     const faceId = simplefaceIdArray[idx];
            //     createData[selectFaceType] = { [faceId]: 1 };
            //     console.log('====getNewCircleData2===技能表情无合适==改==氛围表情首选==', selectFaceType, faceId);
            // }

        } else if (circleKind === 2) {  //词条
            const faceTypeIdx = getRandomInt(0, Object.keys(faceTypeClone).length - 1);
            const value: any = Object.values(faceTypeClone)[faceTypeIdx];
            selectFaceType = value.id; //颜色大类确定

            if (this.allWordFaceIdArray.length === 0) {
                this.initStageWords();
            }
            const idx = getRandomInt(0, this.allWordFaceIdArray.length - 1);
            const faceId = this.allWordFaceIdArray[idx];
            this.allWordFaceIdArray.splice(idx, 1); //用了的faceId 删除
            createData[selectFaceType] = { [faceId]: 1 };
            console.log('====getNewCircleData2=====词条表情首选==', selectFaceType, faceId);
        }

        // A 1,2,3,4,5,6,7,8,9,10
        // B 3,4,5,6,7,8,9,10
        // C 5,6,7,8,9,10
        // D 8,9,10 其中D需要特殊处理，8和9只能收集最多40%，剩下的只有在最后一关才出

        const circleFaceNum = difficultConfig['circleFaceNum' + (circleType + 1)]
        const circleFaceWeight = difficultConfig['circleFaceWeight' + (circleType + 1)]
        let arr3: Array<WeightMsg> = [];
        circleFaceWeight.forEach((weight, idx) => {
            arr3.push({ id: idx, weight: weight })
        })
        const idx = RandomLW.randByWeight(arr3); //得到face数量的idx
        const faceCount = circleFaceNum[idx]; //这个颜色的数量
        console.log('====getNewCircleData2==表情总数确定======', faceCount, '====还需要创建的表情数量=====', faceCount - 1);

        const needCreateCount = faceCount - 1; //还需要创建的表情数量
        //容错处理
        if (needCreateCount == 0) { //如果表情数量只有1个 则一定是单色 上面随机出双色也改为单色 
            colorCount = 1;
        }

        let firstCount = 0; //第一个颜色创建的数量
        for (let i = 0; i < colorCount; i++) {
            let faceType = selectFaceType;
            if (i > 0) {
                delete faceTypeClone[faceType]; //去除已经随到的颜色大类

                const faceTypeIdx = getRandomInt(0, Object.keys(faceTypeClone).length - 1);
                const value: any = Object.values(faceTypeClone)[faceTypeIdx];
                faceType = value.id; //颜色大类确定
                createData[faceType] = {};
            }

            console.log('=====getNewCircleData2=====2222==========', i, faceType)

            let curFaceTypeCount = 0; //本颜色大类需要创建的数量
            if (colorCount === 1) {
                curFaceTypeCount = needCreateCount;
            } else {
                if (i === 0) {
                    curFaceTypeCount = Math.floor(needCreateCount / 2);
                    firstCount = curFaceTypeCount;
                } else {
                    curFaceTypeCount = needCreateCount - firstCount;
                }
            }
            console.log(i, '====getNewCircleData2==本颜色还需要创建数量==1===', curFaceTypeCount);

            for (let k = 0; k < curFaceTypeCount; k++) {
                const faceTypeConfig: FaceType = faceTypeClone[faceType];
                console.log(i, '====getNewCircleData2==本颜色还需要创建数量==222===', faceType, JSON.stringify(faceTypeClone), faceTypeConfig);
                const simplefaceIdArray = faceTypeConfig.simplefaceIdArray;

                const faceIdIdx = getRandomInt(0, Object.keys(simplefaceIdArray).length - 1);
                let faceId = simplefaceIdArray[faceIdIdx];
                console.log('====getNewCircleData2==add===faceId==', faceId);

                if (!createData[faceType][faceId]) {
                    createData[faceType][faceId] = 0;
                }
                createData[faceType][faceId] += 1;
            }
        }
        console.log(circleType, '======getNewCircleData2=======createData===success=========', createData);

        return [circleType, createData];
    }


    getSkillWordCount(_type: FaceKindType) {
        let count = 0;
        for (let i = 0; i < this.boxNode.children.length; i++) {
            const circleNode = this.boxNode.children[i];
            const modelCircle: ModelCircle = circleNode.getComponent(ModelCircle);
            if (modelCircle.stillExist() && (modelCircle.getState() === CircleState.Pool || modelCircle.getState() === CircleState.Shoot)) {

                const faceTypeData = modelCircle.getFaceTypeData();
                for (const faceType in faceTypeData) {
                    const faceInfo = faceTypeData[faceType]
                    for (const faceId in faceInfo) {
                        const faceKind = Config.Face[faceId].faceKind;
                        if (faceKind === _type) {
                            count += Number(faceInfo[faceId]);
                        }
                    }
                }
            }
        }

        const faceTypeData = this.readyCircleFaceData;
        for (const faceType in faceTypeData) {
            const faceInfo = faceTypeData[faceType]
            for (const faceId in faceInfo) {
                const faceKind = Config.Face[faceId].faceKind;
                if (faceKind === _type) {
                    count += Number(faceInfo[faceId]);
                }
            }
        }


        console.log('========getSkillWordCount=======', _type, count)
        return count;
    }


    initStageWords() {
        if (this.curStage < 2) {
            return;
        }
        const wordNumberSecondStage: any = getGlobalCfgValue('wordNumberSecondStage'); //本关有多少个词条 
        let allWordFaceIdArray = [];
        for (let i = 0; i < wordNumberSecondStage; i++) {
            let count = 0;
            let arr1 = [];
            for (const wordId in Config.Word) {
                const value = Config.Word[wordId];
                arr1.push({ id: count, weight: value.wordWeight })
                count++;
            }
            const idx = RandomLW.randByWeight(arr1); //得到气泡类型 0 1 2 3
            const faceArray = Object.values(Config.Word)[idx].faceArray;
            allWordFaceIdArray.push(...faceArray);
        }

        this.allWordFaceIdArray = allWordFaceIdArray;
        console.log('=========geCurStageWord========', this.allWordFaceIdArray)
    }

    setCollectFaceIds() {
        if (this.curStage === 1) {
            const faceTypes = lwUtils.utils.deepClone(this.stageConfig.circleType);

            let newCircleType = [];
            for (let i = 0; i < 3; i++) {
                const idx = getRandomInt(0, faceTypes.length - 1)
                newCircleType.push(Number(faceTypes[idx]));
                faceTypes.splice(idx, 1);
            }

            (this.stageConfig as any).circleType = newCircleType;
        }


        this.collectFaceIds = [];
        this.collectFaceType = [];
        this.hadCollectFull = [];

        let count = this.stageConfig.collectFaceId.length;

        const faceTypes = lwUtils.utils.deepClone(this.stageConfig.circleType);
        for (let i = 0; i < count; i++) {
            const idx = getRandomInt(0, faceTypes.length - 1)
            const selectFaceType = faceTypes[idx];
            this.collectFaceType.push(Number(selectFaceType));
            this.hadCollectFull.push(0);
            faceTypes.splice(idx, 1);

            const simplefaceIdArray = Config.FaceType[selectFaceType].simplefaceIdArray
            const idx2 = getRandomInt(0, simplefaceIdArray.length - 1)
            const collectFaceId = simplefaceIdArray[idx2];
            this.collectFaceIds.push(Number(collectFaceId));
        }

        console.log("========setCollectFaceIds==========", this.collectFaceIds, this.collectFaceType, this.hadCollectFull);
    }


    // 清空数据
    public clear(): void {
        super.clear();
        this.readyCircleFaceData = {};
    }
}


