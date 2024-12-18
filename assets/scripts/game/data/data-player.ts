

import { SuperData } from './super-data';
// import * as proto from '../../game/proto/msg';

import {
    DATA_LW_NAME,
    REMIND_KEY,
    REMIND_TYPE
} from '../constant/lw-common-define';
// import { MessageType } from '../proto/message-type';
import lwUtils from '../../frame/center/lw_utils/lw-utils';

export class DataLwPlayer extends SuperData {
    name = DATA_LW_NAME.PLAYER_DATA;
    /**
     * 玩家信息
     */
    playerId: string; //用户uid
    playerName: string;//用户名字
    playerLwAvatar: number;//用户头像
    playerLwFrame: number; //用户头像框
    playerLwLevel: number; //用户等级
    playerLwExp: number; // 经验
    loginTime: number; // 本次登录服务器时间(秒)
    loginDays: number; //累计登录天数
    regiserTime: number; //注册时间 时间戳(秒)
    address: string; // 玩家ip地址

    platformLwAvatar: string;
    open_id: string;
    uid: string;
    // buyGiftTime: { [id: string]: number }; //购买记录 随着playerInfo传入
    stage: number;

    guideId = 1; // 当前引导组
    guideStepId = 101; // 当前引导步骤
    guide2: Array<number> = []; // 已经触发过的引导组，配置中特殊设置
    playerInitLwPlatform = 'ios'; // 玩家新注册平台
    ttGameEnterLwRewardStatus = false; // 是否领取了头条入口奖励

    isFirstEnter = true;
    currentLwLoginRemind: { [id: number]: 'on' | 'off' } = {}; //本次登陆不再提醒

    netMessageHanders = {
        // ['PlayerInfoUpdateResponse']: (data: proto.PlayerInfoUpdateResponse) => {
        //     // 玩家信息改变
        //     if (data && data.player_info) {
        //         // this.updatePlayerInfo(data);
        //     }
        // },

    };

    public init(): void {
        super.init();
    }

    public setData(playerData: any, extraData?: any, loginTime?: number, address?: string) {
        this.playerId = playerData.id;
        lwUtils.storage.setGlobalStorageKey(this.playerId); //设置本地存储

        this.playerName = playerData.nickname || 'Name';
        this.playerLwLevel = playerData.level;
        this.platformLwAvatar = playerData.platform_avatar || '';
        if (playerData.avatar > 0) {
            this.playerLwAvatar = playerData.avatar;
        } else {
            this.playerLwAvatar = this.platformLwAvatar.length > 0 ? 0 : 1;
        }
        this.playerLwFrame = playerData.avatar_frame || 1;

        //新手引导
        // this.guideId = (playerData.guide || 0) % 100000;
        // this.guideStepId = ((playerData.guide || 0) - this.guideId) / 100000;
        // 本地若有引导记录跳过已经完成的步骤
        // const guideStep = lwUtils.storage.getItem('guide_step');
        // if (guideStep) {
        //     const [guideId, stepId] = guideStep.split('_');
        //     if (Number(guideId) === this.guideId) {
        //         if (Number(stepId) > this.guideStepId) {
        //             this.guideStepId = Number(stepId);
        //         }
        //     } else if (Number(guideId) === this.guideId + 1) {
        //         // 本地进度和服务器不一致，若本地的id比服务器+1，则以本地进度为准
        //         this.guideId = Number(guideId);
        //         this.guideStepId = Number(stepId);
        //     }
        // }

        this.setPlayerDateLw(playerData,extraData,loginTime,address);
        // this.loginDays = playerData.login_days || 1;  //累计登录天数
        // this.regiserTime = playerData.register_time ? playerData.register_time : 0;

        // this.playerInitLwPlatform = playerData.device_platform === 1 ? 'ios' : 'android';
        // this.loginTime = loginTime;
        // this.stage = playerData.stage || 1;
        // this.address = address;
        // this.guide2 = playerData.guide2 && playerData.guide2.length > 0 ? playerData.guide2 : [];
        // // this.buyGiftTime = playerData.buy_gift_ts || {}; //购买记录

        // if (extraData) {
        //     this.open_id = extraData?.open_id;
        //     this.uid = extraData?.uid;
        //     this.ttGameEnterLwRewardStatus = extraData?.douyin_received;
        // }
    }

    private setPlayerDateLw(playerData: any, extraData?: any, loginTime?: number, address?: string){
        this.loginDays = playerData.login_days || 1;  //累计登录天数
        this.regiserTime = playerData.register_time ? playerData.register_time : 0;

        let numa = 1;
        numa += 1;
        if(numa > 0){
            this.playerInitLwPlatform = playerData.device_platform === 1 ? 'ios' : 'android';
            this.loginTime = loginTime;
            this.stage = playerData.stage || 1;
            this.address = address;
            this.guide2 = playerData.guide2 && playerData.guide2.length > 0 ? playerData.guide2 : [];
            // this.buyGiftTime = playerData.buy_gift_ts || {}; //购买记录

            if (extraData) {
                this.open_id = extraData?.open_id;
                this.uid = extraData?.uid;
                this.ttGameEnterLwRewardStatus = extraData?.douyin_received;
            }
        }else{
            return;
        }

        
    }

    // 设置玩家当前服务器
    setLwCurrentServer(serverId: number, serverName: string) {
        getGameGlobal().currentServerId = serverId;
        getGameGlobal().currentServerName = serverName;
    }

    // 获取玩家当前服务器
    getLwCurrentServer() {
        return { serverId: getGameGlobal().currentServerId, serverName: getGameGlobal().currentServerName };
    }

    // --------- 消息发送和接收 ------------------

    // 抖音版入口奖励
    // requestTtEnterReward() {
    //     const message = new proto.BaseRequest();
    //     this.sendMessage(MessageType.ReceiveDouYinRewardsResponse, message);
    // }

    // -------- 红点逻辑 --------------

    // ---------  消息发送和接收end   ------------------

    /**
     * 获取提示信息的存储状态
     * @param radio_type 类型
     * @param isLoginRemind 本次登录提示
     * @returns
     */
    public getLwRemindState(key: REMIND_KEY, remindTyle: REMIND_TYPE) {
        let keyTemp = 'REMIND_TYPE_{0}_{1}';
        // if (remindTyle === REMIND_TYPE.CURRENT_LOGIN_TIP) {
        //     return this.currentLwLoginRemind[lwUtils.utils.stringFormat(keyTemp, [REMIND_TYPE.CURRENT_LOGIN_TIP, key])] === 'on';
        // } else if (remindTyle === REMIND_TYPE.DAILY_COST_TIP) {
        //     keyTemp = 'REMIND_TYPE_{0}_{1}_{2}';
        //     const zeroTime = lwUtils.time.getDayMidTime();
        //     const toggleState = lwUtils.storage.getItem(lwUtils.utils.stringFormat(keyTemp, [REMIND_TYPE.DAILY_COST_TIP, key, zeroTime]));
        //     return toggleState === 'on';
        // }

        if (remindTyle === REMIND_TYPE.DAILY_COST_TIP) {
            keyTemp = 'REMIND_TYPE_{0}_{1}_{2}';
            const zeroTime = lwUtils.time.getDayMidTime();
            const toggleState = lwUtils.storage.getItem(lwUtils.utils.stringFormat(keyTemp, [REMIND_TYPE.DAILY_COST_TIP, key, zeroTime]));
            return toggleState === 'on';
        } else if (remindTyle === REMIND_TYPE.CURRENT_LOGIN_TIP) {
            return this.currentLwLoginRemind[lwUtils.utils.stringFormat(keyTemp, [REMIND_TYPE.CURRENT_LOGIN_TIP, key])] === 'on';
        }
    }

    //------------------ 角色升阶  end-------------------------------

    public clear(): void {
        super.clear();

        this.playerId = null;
        this.playerName = null;
        this.playerLwAvatar = null;
        this.platformLwAvatar = null;
        this.playerLwFrame = null;
        this.playerLwLevel = 1;
        // this.playerFight = 0; //战力
        this.playerLwExp = 0; // 经验
        this.stage = 1;
        this.open_id = null;
        this.uid = null;
        this.guideStepId = 101; // 当前引导步骤
        this.playerInitLwPlatform = 'ios'; // 玩家新注册平台
        this.ttGameEnterLwRewardStatus = false; // 是否领取了头条入口奖励
        this.regiserTime = 0;
        // this.rechargeSum = 0;
        // this.rechargeReward = [];
        this.isFirstEnter = true;
        this.currentLwLoginRemind = {}; //本次登陆不再提醒
        lwUtils.storage.setGlobalStorageKey('');
    }
}
