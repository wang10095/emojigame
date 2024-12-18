
import lwUtils from "../../frame/center/lw_utils/lw-utils";

export const optDefineData = {
    host: '',
    project: 'qqemoji',

}

export enum AnalyticsEventType {
    Login = 'login',
    StartGame = 'start_game',
    GAME_MEMORY_WARNING = 'game_memory_warning',
    GAME_ERROR_BY_LW = 'game_error',
    B_LEAVE_PAGE = 'b_leave_page',

    START_APPLETS = 'start_applets', //每次启动小程序且获取到unionid(微小)/openid(抖小)后上报
    B_LOGION_SUCCESS = 'b_login_success', //登录成功上报
    B_ENTRY_PAGE = 'b_entry_page', //打开页面时上报，平台意思是游戏界面
    B_ENTRY_GAME_PAGE = 'b_entry_game_page', //打开游戏上报 ，统计游戏时长，相当于玩具游戏时间的标记
    B_LEAVE_GAME_PAGE = 'b_leave_game_page', //离开游戏上报，统计游戏时长，相当于玩具游戏时间的标记
    PAY_SUCCESS = 'pay_success', //每次付费成功后上报
    AD_SHOW = 'ad_show', //广告展示上报
    OPEN_BOX = 'open_box', //打开宝箱上报
    OPEN_BOX_TIME = 'open_box_time', //打开宝箱时间上报
    B_HOME_PAGE_CLICK = 'b_home_page_click', //点击主界面各按钮时上报
    B_CLICK_ITEM_ICON = 'b_click_item_icon', //列表样式icon按钮点击时上报
    GAME_RELEASE_BUNDLE = 'game_release_bundle',
}

export class TESdk extends lwUtils.Singleton {
    _tesdk = null;
    constructor() {
        super();
    }

    init() {
        const config = {
            appId: '',
            serverUrl: '',
            autoTrack: {
                appShow: true,
                appHide: true,
            }

        }
        TDAnalytics.init(config);

        var superProperties = {
            channel: "game", //字符串
            age: 1,//数字
            isSuccess: true,//布尔
            time: lwUtils.time.dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),//上传时间
        };
        //设置公共事件属性
        TDAnalytics.setSuperProperties(superProperties);

        //设置用户属性
        TDAnalytics.userSet({
            properties: {
                username: "TE"
            }
        });

    }

    reportTrackingLog(_eventName: AnalyticsEventType | string, data: any) {
        TDAnalytics.track({
            eventName: _eventName,
            properties: data,
        })
    }

    reportTrackingAdLog(_eventName: AnalyticsEventType | string, data: any) {

    }
}