

// 服务器状态
// export enum ServeState {
//     New = 0, // 新
//     Fluent = 1, // 流畅
//     Full = 2, // 爆满
//     Await = 3 // 期待
// }

import { AdsShowPanel } from "../battle/ads-show-panel";

// // 服务器基础状态
// export enum ServeBaseState {
//     Normal = 0, // 正常
//     Maintaining = 1, // 维护
//     HighLoad = 2 // 高负载，不允许新建账号了
// }

// 预制路径
export const UI_NAME = {
    // --common--
    //Alert: 'common://lw-alert', //通用确认弹窗
    //AlertTip: 'common://lw-alert_tip', //通用确认弹窗
    // NoticePanel: 'common://notice_panel', //公告
    HelpPanel: 'battle://help_panel', //帮助页面


    GameSuccessPanel: 'battle://battle_success_panel',//游戏胜利
    GameFailPanel: 'battle://battle_fail_panel', //游戏失败
    GameRevivePanel: 'battle://battle_revive_panel', //复活界面
    BattleUseProp: 'battle://battle_use_prop',
    AdsShowPanel: 'battle://ads_show_panel',
    SetPanel: 'home://set_panel',//设置
    GuildPanel: 'battle://guild_panel',
};


export const RES_TYPE = {

}

// // 常用道具
export enum ITEM_ID {
    GOLD = 10001,
    EXP = 10002,
}


export enum ITEM_TYPE {
    GOLD = 1,
    EXP = 2,
}


// 远程bundle方式加载资源
export const RES_URL = {
    //     BATTLE_NPC: '{0}://{1}', // 怪物形象
    //     ELF_SPINE: '{0}://{1}', // 精灵形象
    //     SKILL_ID: '{0}://skill', // 战斗技能
    //     SKILL_START_EFFECT: '{0}://start_effect' // 发起攻击的单位特效

    //     //   // ------- 加密资源 ---------
    //     //  ROLE_SKIN: '{0}://{1}', // 角色皮肤 skin/part/name
};

export enum REMIND_KEY {
    Config_Change // 配置修改
}

// remote方式加载的远程资源
// export const REMOTE_RES_URL = {
//     //     // ------- 加密资源 ---------
//     //     ROLE_SKIN: 'res/skin/{0}/{1}.bin', // 角色皮肤 skin/part/name
//     //     ICON_SUIT: 'res/suits/{0}.abin', // 套装 suits/name
//     //     // ------- 非加密资源 ---------
//     //     BG_ITEM: 'res/items/{0}_bg_{1}.png', //item://equip_skin_bg_0,或 item_bg_0
//     //     ICON_ITEM: 'res/items/{0}.png',
//     //     //  ------- 远程plist 资源加载 ----------
//     //     REMOTE_ATLAS: 'res/atlas/{0}', // atlas 图集文件加载
// };

// 倒计时时间ID
export const TIMER_LW_ID = {
    GAME_SERVER_TIME: 'game_server_time',
};

// UI层事件名称
export const UI_LW_EVENT_NAME = {
    GAME_ERROR_BY_LW: 'game_lw_error', //游戏异常
    GAME_WIN_LW_CLOSE: 'game_lw_win_close', //弹窗关闭通知
    GAME_WIN_LW_SHOW: 'game_lw_win_show', //弹窗显示
    GAME_EXIT: 'game_lw_exit', // 游戏中途踢出
    GAME_ENTER_FINISH: 'game_enter_lw_finish', //作为获取游戏数据结束标志
    GAME_SWITCH_LW_SCENE_PRE: 'game_switch_lw_scene_pre', // 切换场景前
    GAME_SWITCH_LW_SCENE: 'game_switch_lw_scene', // 切花游戏场景后
    // GAME_REFRESH_NEXT_DAY: 'game_refresh_next_day', // 跨天刷新
    //UPDATE_LW_SERVER_LIST: 'update_server_list', // 服务器列表
    //SWITCH_SERVER: 'switch_server', // 切换当前服务器
    //LOAD_PLIST_SKIN_OVER: 'load_plist_skin_over', // 远程加载皮肤准备完毕
    SHOW_LOG_VIEW: 'SHOW_LOG_VIEW',
    LOADING_SHOW: 'LOADING_SHOW',

    //game
    CIRCLE_FIRST_CONTACT: 'circle_first_contact',//气泡首次碰撞
    CIRCLE_FULL_BOOM: 'circle_full_boom', //气泡满了爆开,
    UNDERPIN_DESTORY_BROADCAST: 'underin_destory_broadacst',//底座销毁广播
    SKILL_TRIGGER: 'skill_trigger',//技能触发
    COLLECTION_WORD: 'colltion_word', //收集词条
    COLLECTION_WORD_UPDATE: 'colltion_word_updatee',//词条飞到收集栏数量更新
    COLLECTION_FACE: 'collection_face',
    WORD_TRIGGER: 'word_trigger',//词条触发
    GAME_NEXT: 'game_next', //重新开始游戏
    CIRCLE_TOUCH_DESTORY: 'circle_touch_destory', //气泡点击销毁
    READY_CIRCLE_CHANGE_CAIHONG: 'ready_circle_change_caihong',//准备气泡face都变成彩虹
    USE_BATTLE_PROP: 'use_battle_prop',
};

// export const ANIMATION_EVENT = {
//     ANIMATION_END_CALLBACK: 'animation_end_callback',
//     ANIMATiON_STET_CALLBACK: 'animation_start_callback',
// }

// Data 数据层事件
export const DATA_LW_EVENT_NAME = {
    // UPDATE_PLAYER_INFO: 'update_player_info',
    // UPDATE_PLAYER_MACHINE: 'update_player_machine',
    // UPDATE_PLAYER_FIGHT: 'update_player_fight',
};

// 数据类名称
export const DATA_LW_NAME = {
    //ABTEST_DATA: 'abtest_data',
    BATTLE_DATA: 'battle_data',
    COMMON_DATA: 'common_data',
    FEATURE_STATUS_DATA: 'feature_status_data',
    GUIDE_DATA: 'guide_data',
    ITEM_DATA: 'item_data',
    PLAYER_DATA: 'player_data',
    //RECHARGE_DATA: 'recharge_data',
    //SHOP_DATA: 'show_data',
    SKILL_DATA: 'skill_data',
    STORY_DATA: 'story_data',
    TASK_DATA: 'TASK_DATA',
    WORD_DATA: 'WORD_DATA',
};

// NET层事件名称
// export const NET_EVENT_NAME = {
//     NET_UPDATE_ITEMS: 'net_update_items',
//     NET_UPDATE_SKINS: 'net_update_skins'
// };

// Storage 本地存储key
// export const STORAGE_KEY = {
//     USER_NAME: 'niudan_user',
//     PASS_WORD: 'niudan_pwd',
// };

// 展示方式
export enum ItemShowType {
    OWNER = 0, // 自身拥有
    ONLY_SHOW = 1, // 数量展示
    COST_SHOW = 2, // 花费展示
    COST_OWNER = 3 // 花费和自身展示
}

// 领奖状态
export enum REWARD_STATUS {
    INVALID = 0,
    CLAIMABLE,
    CLAIMED
}



//功能ID  Key和按钮名称保持对应 比如：Arena 按钮对应 btn_arena
// export enum FeatureId {
//     Arena = 1, //竞技场
//     //扭蛋升级
//     Gacha_Upgrade = 2,
//     //主线关卡
// }

export enum CountdownTypeByLw {
    'ss' = 1,
    'MM:ss' = 2,
    'HH:MM:ss' = 3,
    'HH:MM' = 4,
    'dd天' = 5,
    'dd天HH时' = 6,
    'dd天HH时MM分' = 7,
    'dd天HH:MM:ss' = 8,
    'ss秒' = 9,
    'MM分ss秒' = 10,
    'HH时MM分ss秒' = 11,
    'dd天HH时MM分ss秒' = 12,
    'MM分' = 13,
    'HH时' = 14,
    'HH时MM分' = 15
}

// 按钮提示类型
export enum REMIND_TYPE {
    None = 0,
    DAILY_COST_TIP, //今日花费提示
    CURRENT_LOGIN_TIP // 本次登录不再提示
}


//========================================================
export enum CircleSizeType { //气泡大小类型  暂时不用
    Small = 0,
    Medium = 1,
    Big = 2,
    Max = 3,
}

export enum CircleState {
    Wait = 0, //在右上角等待
    Ready = 1, //准备发射
    Move = 2, //玩家移动中
    Shoot = 3, //下落
    Pool = 4,//在池子中
    Delete = 5, //自爆销毁
}

export enum CircleKindType {
    Null = 0,
    OneColor = 1,
    TwoColor = 2,
}

export enum GroupType {
    None = 0,
    Default = 1,
    Circle = 2,
    Face = 4,
    Skil = 16,
    Ground = 32,
}


export const anyCircleType = 8;
export const anyCircleFaceId = 1701;