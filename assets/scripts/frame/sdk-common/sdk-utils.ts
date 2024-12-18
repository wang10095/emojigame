import { _decorator } from 'cc';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { isBrowser, isByteDance, isWeChat } from '../../game/lw-game-define';
import { SuperSdk } from './super-sdk';
// import { IByteDanceSdk } from './bytedance-sdk';
import { WechatLwSdk } from './wechat-sdk';
import { AnalyticsEventType } from './TE-sdk';

const { ccclass, property } = _decorator;

// 整合小游戏sdk，统一化接口
export class SdkUtils extends lwUtils.Singleton {
    private miniLwPlatformSdk: SuperSdk;

    private gameFrontTime = Date.now();
    // public minisdkLoginCode: string; // 第三方登录的code标记
    constructor() {
        super();
        this.init();
    }

    init() {
        if (isWeChat) {
            this.miniLwPlatformSdk = new WechatLwSdk();
        } else if (isByteDance) {
            // this.miniLwPlatformSdk = new IByteDanceSdk();
        }
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.addListenerBackOrFrontByLw((tag: string) => {
            console.log('WebTrackingSdk tag:', tag);
            if (tag === 'front') {
                // this.gameFrontTime = Date.now();
                // this.miniLwPlatformSdk.reportLwTracking(AnalyticsEventType.B_ENTRY_PAGE, {
                //     act_page: 'game' //页面名称
                // });
            } else {
                // this.miniLwPlatformSdk.reportLwTracking(AnalyticsEventType.B_LEAVE_PAGE, {
                //     act_page: 'game', //页面名称
                //     duration: Date.now() - this.gameFrontTime //毫秒
                // });
            }
        });
    }

    // 游戏包信息
    getLwGamePackageInfo() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.getLwGamePackageInfo();
    }

    // 新版本检测
    checkHaveNewVersion() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.checkHaveNewVersion();
    }

    showToast(des: string) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.showToast(des);
    }

    // 登录
    async login(call?: (code: any) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.miniLwPlatformSdk.login(res => {
                if (res && res.code) {
                    call && call(res);
                    resolve(res);
                } else {
                    call && call(null);
                    reject();
                }
            });
        });
    }

    // 用户信息
    getUserInfo(call: (res: any) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.getUserInfo(call);
    }

    getUserInfoSync() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.getUserInfoSync();
    }

    // 获取归因
    getOptionsSync() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.getOptionsSync();
    }

    // 获取系统信息
    getSystemInfoSync() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.getSystemInfoSync();
    }

    // 用户隐私
    requireUserPrivacy() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.requireUserPrivacy();
    }

    

    // /**
    //  *  充值接口
    //  * @param orderId 业务段订单号
    //  * @param gameDiamondNum 对应游戏中的钻石数量
    //  * @param shopItemId 商品唯一标识
    //  * @param shopItemName 商品名称
    //  * @param callBack 充值返回
    //  * @returns
    //  */
    // payRecharge(orderId: string, gameDiamondNum: number, shopItemId: string, shopItemName: string, callBack: (statusCode: 0 | 1 | 2 | 3) => void) {
    //     if (!this.miniLwPlatformSdk) {
    //         return;
    //     }
    //     this.miniLwPlatformSdk.payRecharge(orderId, gameDiamondNum, shopItemId, shopItemName, callBack);
    // }

    // 侧边栏是否可用
    checkLwSideBarEnable(call: (res: boolean) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.checkLwSideBarEnable(call);
    }

    // 游戏启动场景
    getGameLwLaunchFrom() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.getGameLwLaunchFrom();
    }

    /**
     * 重启小游戏
     */
    resetartLwMiniGame() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.resetartLwMiniGame();
    }

    //手机短暂震动
    vibrateLwShort() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.vibrateLwShort();
    }

    /**
     *  屏幕保持唤醒
     */
    keepGameScreenOn() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.keepGameScreenOn();
    }

    // 创建广告
    createLwRewardedVideoAd(adId: string) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.createLwRewardedVideoAd(adId);
    }

    // 播放广告
    showLwRewardedVideoAd(adId: string, call: (res: any) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.showLwRewardedVideoAd(adId, call);
    }

    // 填充广告的唯一标识
    getAdFillUUID(adId: string): string {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.adWithUUID[adId];
    }

    // 销毁实例
    destroyRewardedVideoAdByLw(videoAd: any) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.destroyRewardedVideoAdByLw(videoAd);
    }
    // 切换到侧边栏入口
    nativeToByLwScene() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.nativeToByLwScene();
    }
    /**
     *  上报日志
     *  @type common 平台统一 game 游戏自己的数据统计
     */
    reportLwTracking(eventType: AnalyticsEventType | string, data: Record<string, any>, immediate = false) {
        // if (!this.miniLwPlatformSdk && !isBrowser) {
        //     return;
        // }
        // if (isBrowser) {
        //     console.log('=======reportLwTracking========', eventType, data);
        //     webtrackingSdk.reportTrackingLog(eventType, data);
        // } else {
        //     this.miniLwPlatformSdk.reportLwTracking(eventType, data);
        // }
    }

    // 开始录屏
    startRecoder() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.startRecoder();
    }

    // 停止录屏
    stopRecoder() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.stopRecoder();
    }

    /**
     * 视频分享
     * @param type
     * @param filePath 资源地址或者模版id
     */
    shareGame(type: 'video' | 'link' | 'article' | 'token', filePathOrTempId: string) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.shareGame(type, filePathOrTempId);
    }
    // 联系GM
    connectGM() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.connectGM();
    }

    reportLwTrackingAd(eventType: AnalyticsEventType, data: Record<string, any>) {
        // if (!this.miniLwPlatformSdk) {
        //     return;
        // }
        // const adUUID = this.getAdFillUUID(data.unit_id);
        // data['uuid'] = adUUID;
        // this.miniLwPlatformSdk.reportLwTrackingAd(eventType, data);
    }
    

    // 小游戏进入前台或后天展示
    addListenerBackOrFrontByLw(call: (tag: string) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.addListenerBackOrFrontByLw(call);
    }

    // 复制文本
    copyText(txt: string) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.copyText(txt);
    }

    // 请求文件下载
    requestDownload(url: string, option: { method: 'GET' | 'POST'; data?: any }, call: (err, data) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.requestDownload(url, option, call);
    }

    async downloadFile(url: string, saveFilePath: string, downCount = 0) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.downloadFile(url, saveFilePath, downCount);
    }

    requestTriggerGC() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.requestTriggerGC();
    }

    checkNetType(call: (type: string) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.checkNetType(call);
    }
    // ---------- 文件处理 ---------------
    // 判断是否存在文件
    isExistFile(filePath: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.isExistFile(filePath);
    }

    // 用户目录
    writeFile(fileName: string, content: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.writeFile(fileName, content);
    }

    // 复制文件
    copyFile(srcPath: string, distPath: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.copyFile(srcPath, distPath);
    }

    // 创建文件路径
    mkDir(dirPath: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.mkDir(dirPath);
    }

    // 移除文件夹
    rmDir(dirPath: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.rmDir(dirPath);
    }

    // 读取文件
    readFile(filePath: string): string | ArrayBuffer {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.readFile(filePath);
    }
    // 解压文件
    async unzipFile(zipPath: string, targetPath: string) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.unzipFile(zipPath, targetPath);
    }

    // 删除文件
    deleteFile(filePath: string): boolean {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        return this.miniLwPlatformSdk.deleteFile(filePath);
    }

    onShareAppMessage(call: (res: any) => void) {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.onShareAppMessage(call);
    }

    showShareMenu() {
        if (!this.miniLwPlatformSdk) {
            return;
        }
        this.miniLwPlatformSdk.showShareMenu();
    }
}
export const sdkUtils = SdkUtils.getInstance();
