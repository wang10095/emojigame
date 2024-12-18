import {
    DATA_LW_NAME,
    UI_LW_EVENT_NAME,
} from '../constant/lw-common-define';
import { SuperData } from './super-data';
import { DataManager } from './data-manager';
import { Vec3 } from 'cc';
import { Vec2 } from 'cc';
import { SkillAction, SkillBoom1, SkillBoom2, SkillBoom3 } from '../../model/skill/skill-base';
// import { WordStatus } from './word-data';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { PropType } from '../constant/skill-define';
import { ModelCircle } from '../../model/model-circle';

//当前技能状态
export enum SkillStatus {
    None = 0,
    Playing = 1,
    Stop = 3, //当前不要播放技能 可能别的行为在进行
}

export class DataSkill extends SuperData {
    name = DATA_LW_NAME.SKILL_DATA;
    netMessageHanders = {
        // ['CommonAwardResponse']: (data: proto.BaseResponse, requestData: proto.CommonAwardRequest) => {
        //     this.responseCommonAward(data, requestData);
        // },
    };

    public init(...args: any[]): void {
        super.init();
        this.curSkill = null;
        this.skillQueue = [];

        // this.skillActionMap['boomAction1'] = new SkillBoom1();
        // this.skillActionMap['boomAction2'] = new SkillBoom2();
        // this.skillActionMap['boomAction3'] = new SkillBoom3();
    }

    skillQueue = []; //存储技能的队列
    status = SkillStatus.None; //当前队列状态
    curSkill: any = null;

    triggerPos: Vec2 = null;
    ownWordZi: Map<number, number> = new Map(); //已经拥有的汉字  


    skillActionMap: Map<string, SkillAction> = new Map<string, SkillAction>();

    //添加技能 @params [道具类型(技能|词条),id，config]
    addSkillQueue(skillConfig: any) {
        console.log('=======skill 加入队列==========', skillConfig);
        this.skillQueue.push(skillConfig);
        this.nextSkillTrigger();
    }

    nextSkillTrigger() {
        let hadCircle = false;
        for (let i = 0; i < DataManager.dataBattle.boxNode.children.length; i++) {
            const circleNode = DataManager.dataBattle.boxNode.children[i];
            if (circleNode.getComponent(ModelCircle).stillExist()) {
                hadCircle = true;
                break;
            }
        }

        if (!hadCircle) { //已经没有气泡了
            this.skillQueue = [];
            return;
        }

        if (this.status === SkillStatus.None) {
            this.curSkill = this.skillQueue.shift();
            if (this.curSkill) {
                this.status = SkillStatus.Playing;

                if (this.curSkill[0] === PropType.Skill) {
                    this.lwDispatchUIEmit(UI_LW_EVENT_NAME.SKILL_TRIGGER);
                } else if (this.curSkill[0] === PropType.Word) {
                    this.lwDispatchUIEmit(UI_LW_EVENT_NAME.WORD_TRIGGER);
                }

            } else {
                this.status = SkillStatus.None;
                // DataManager.dataWord.setStatus(WordStatus.None); //技能触发完后 触发词条
                // if (DataManager.dataWord.wordQueue.length > 0) {
                //     DataManager.dataWord.nextSkillTrigger();
                // }
            }
        }
    }

    setStatus(status: SkillStatus) {
        console.log('======skilldata=====setStatus=========', status);
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    //判断faceid是否是词条
    checkWordByFaceId(faceId: number) {
        const wordConfig = DataManager.dataBattle.wordConfig;
        for (const wordId in wordConfig) {
            const value: Word = wordConfig[wordId];
            if (value.faceArray.includes(faceId)) {
                return Number(wordId);
            }
        }
        return false;
    }

    addWordZi(faceId: number, count: number) {
        if (this.ownWordZi.has(faceId)) {
            let curCount = this.ownWordZi.get(faceId);
            curCount += count;
            this.ownWordZi.set(faceId, curCount);
            console.log('======addWordZi======', faceId, curCount);
        } else {
            this.ownWordZi.set(faceId, count);
            console.log('======addWordZi======', faceId, count);
        }

        console.log('========addWordZi==============', Array.from(this.ownWordZi));
    }

    //收集词条全了 减去相应的face
    subWordZi(faceId: number, count: number = 1) {
        if (this.ownWordZi.has(faceId)) {
            const curCount = this.ownWordZi.get(faceId);
            console.log('=======subWordZi===============', faceId, curCount, count)
            if (Number(curCount) == Number(count)) {
                this.ownWordZi.delete(faceId);
                console.log('=====delete==wordzi================', faceId);
            } else {
                const newCount = curCount - count;
                this.ownWordZi.set(faceId, newCount);
            }
        } else {
            console.error("=====这个词没有了=========");
        }

        console.log('======subWordZi===end======', Array.from(this.ownWordZi))

    }

    getWordZi(faceId: number) {
        return this.ownWordZi.get(faceId);
    }

    // 10001: { wordId: 10001, faceArray: [8, 9, 10, 11], chinese: ['强', '到', '爆', '炸'] },
    //退退退 强到爆炸  鸡你太美
    checkFullCollectWord() {
        console.log('=====checkFullCollectWord===1===', this.ownWordZi)
        //判断有没有收集全的词条
        const wordConfig = lwUtils.utils.deepClone(DataManager.dataBattle.wordConfig);
        let hadFull = false;
        for (const wordsId in wordConfig) {
            const value = wordConfig[wordsId];
            const faceArray = value.faceArray;

            let cloneWordZi = lwUtils.utils.deepClone(this.ownWordZi);

            let canFull = true;
            for (let i = 0; i < faceArray.length; i++) {
                const faceId = faceArray[i];

                if (cloneWordZi.has(faceId)) {
                    let count = cloneWordZi.get(faceId);
                    count--;
                    if (count === 0) {
                        cloneWordZi.delete(faceId);
                    } else {
                        cloneWordZi.set(faceId, count);
                    }
                } else {
                    canFull = false;
                    break;
                }
            }
            if (canFull) {
                hadFull = true;
                for (let k = 0; k < faceArray.length; k++) {
                    this.subWordZi(faceArray[k], 1);
                }

                console.log('=====checkFullCollectWord=== Full ===', Array.from(this.ownWordZi));
                this.addSkillQueue([PropType.Word, value.wordId, Array.from(this.ownWordZi)]);
            }
        }

        if (hadFull) { //有满的再看看还有没有满的
            this.checkFullCollectWord();
        }
    }

    // 清空数据
    public clear(): void {
        super.clear();
        this.skillQueue = [];
        this.curSkill = null;
    }
}
