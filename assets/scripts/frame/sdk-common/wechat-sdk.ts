import { _decorator, assetManager } from 'cc';

import { i18n } from '../../frame/center/lw_managers/lw-language-manager';
import { LWManager} from '../../frame/center/lw-manager';
import { super_wechat_LwSdk } from './super-wechat-LwSdk';

const { ccclass, property } = _decorator;

export class WechatLwSdk extends super_wechat_LwSdk {
    

    constructor() {
        super();
        // wx.onMemoryWarning(res => {
        //     console.log('onMemoryLwWarning:', res);
        //     this.requestTriggerGC();
        //     LWManager.lweventManager.emitLw('MemoryLwWarning', res);
        // });
    }

    

    // 充值功能
    // 0 成功 1 取消 2 ios成功 3 ios取消
    // payRecharge(
    //     orderId: string,
    //     rmbNum: number,
    //     shopItemId: string,
    //     shopItemName: string,
    //     callBack: (statusCode: 0 | 1 | 2 | 3, errorMsg?: string) => void
    // ) {
    //     if (this.getSystemInfoSync()?.platform === 'ios') {
    //         // wx.showModal({
    //         //     title: '购买提示',
    //         //     content: '即将打开客服聊天界面，输入"cz"或者"充值"即可获得充值链接，如果未返回充值链接请重新进入客服聊天界面',
    //         //     showCancel: false,
    //         //     confirmText: '我知道了',
    //         //     success: res => {
    //         //         if (res.confirm) {
    //         //             // this.connectGM();

    //         //         } else {
    //         //             callBack && callBack(3);
    //         //         }
    //         //     }
    //         // });
    //         wx.openCustomerServiceConversation({
    //             showMessageCard: true,
    //             sendMessageTitle: '我想购买' + shopItemName,
    //             sendMessagePath: JSON.stringify({
    //                 messageType: 'IosOrder',
    //                 shopItemName: shopItemName
    //             }),
    //             sendMessageImg: '',
    //             sessionFrom: JSON.stringify({
    //                 messageType: 'IosOrder',
    //                 orderId: orderId,
    //                 amount: rmbNum,
    //                 shopItemId: shopItemId,
    //                 shopItemName: shopItemName
    //             })
    //         });
    //         console.log('用户点击支付提示，进入客服界面');
    //         callBack && callBack(2);
    //     } else {
    //         console.log('recharge:', orderId, rmbNum, shopItemId);
    //         const payObj: any = {
    //             mode: 'game', //	支付的类型，不同的支付类型有各自额外要传的附加参数。
    //             env: getGameGlobal().inView ? 1 : 0, // 0米大师正式环境 1米大师沙箱环境
    //             offerId: '1450172862', // 在米大师侧申请的应用 id
    //             currencyType: 'CNY', // 币种
    //             platform: 'android', // 申请接入时的平台，platform 与应用id有关。
    //             buyQuantity: rmbNum, // 购买数量。mode=game 时必填。购买数量。详见 buyQuantity 限制说明。
    //             zoneId: 1, // 分区 ID
    //             outTradeNo: orderId, //业务订单号
    //             success: () => {
    //                 // 接口调用成功的回调函数
    //                 callBack && callBack(0);
    //                 wx.showModal({
    //                     title: i18n.f('recharge_success_title'),
    //                     content: i18n.f('recharge_success_des'),
    //                     showCancel: false,
    //                     success(res) { }
    //                 });
    //             },
    //             fail: res => {
    //                 //	接口调用失败的回调函数
    //                 console.log('支付失败', res);
    //                 callBack && callBack(1, JSON.stringify(res));
    //                 let errorMsg = i18n.f('recharge_faild_des');
    //                 if (res.errCode === -2) {
    //                     errorMsg = i18n.f('recharge_faild_cancel');
    //                 }
    //                 wx.showModal({
    //                     title: i18n.f('recharge_faild_title'),
    //                     content: errorMsg,
    //                     showCancel: false,
    //                     success(res) { }
    //                 });
    //             },
    //             complete(res) {
    //                 console.log('支付调用完成', res);
    //             }
    //         };
    //         wx.requestMidasPayment(payObj);
    //     }
    // }

    /**
     * 重启小游戏
     */
    resetartLwMiniGame() {
        this.lwccc();
        wx.restartMiniProgram({});
    }

    //手机震动
    vibrateLwShort() {
        this.lwccc();
        wx.vibrateShort(null);
    }

    // 保持屏幕常亮
    keepGameScreenOn() {
        this.lwccc();
        wx.setKeepScreenOn({
            keepScreenOn: true
        });
    }

    // 创建激励视频广告实例，提前初始化
    createLwRewardedVideoAd(adId: string) {
        console.log('createLwRewardedVideoAd:', adId, this.getSystemInfoSync().SDKVersion);
        if (wx.createRewardedVideoAd && !this.rewardedVideoAds[adId]) {
            this.lwccc();
            console.log('createLwRewardedVideoAd: enter');
            const videoAd = wx.createRewardedVideoAd({
                adUnitId: adId, // 'adunit-078ae165ea641b5b'
                multiton: true // 是否启用多例模式，默认为false，该参数仅在基础库2.8.0或以上的版本支
            });
            videoAd.onError(res => {
                console.warn('createLwRewardedVideoAd: onError', res);
            });
            console.log('createLwRewardedVideoAd: videoAd', videoAd);
            this.rewardedVideoAds[adId] = videoAd;
            this.adWithUUID[adId] = this.generateUUID();
        }
    }

    // 播放广告
    showLwRewardedVideoAd(adId: string, call: (res: any, detail?: string) => void) {
        let videoAd = this.rewardedVideoAds[adId];
        if (!videoAd) {
            videoAd = this.createLwRewardedVideoAd(adId);
            call && call('inited');
        }
        if (!videoAd) {
            return;
        }
        this.lwccc();
        videoAd.offClose();
        videoAd.offError();
        videoAd.offLoad();
        videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if ((res && res.isEnded) || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                call && call('success');
            } else {
                // 播放中途退出，不下发游戏奖励
                call && call('cancel');
            }
            this.adWithUUID[adId] = null;
            call && call('inited');
        });
        videoAd.onLoad(res => {
            this.adWithUUID[adId] = this.generateUUID();
            call && call('loaded');
        });
        videoAd.onError(res => {
            call && call('error', res.errCode + ':' + res.errMsg);
        });
        // 用户触发广告后，显示激励视频广告
        call && call('show');
        videoAd
            .show()
            .then(() => {
                call && call('showed');
            })
            .catch(() => {
                // 失败重试
                call && call('load');
                videoAd
                    .load()
                    .then(() => {
                        call && call('show');
                        videoAd.show().then(() => {
                            call && call('showed');
                        });
                    })
                    .catch(err => {
                        call && call('loadOrShowFaild', JSON.stringify(err));
                        console.error('激励视频 广告显示失败', err);
                    });
            });
    }

    // 销毁实例
    destroyRewardedVideoAdByLw(adId: string) {
        const videoAd = this.rewardedVideoAds[adId];
        if (!videoAd) {
            this.lwccc();
            return;
        }
        if (videoAd.destroy) {
            this.lwccc();
            videoAd.destroy();
        }
    }

    // 小游戏进入前台或后天展示
    addListenerBackOrFrontByLw(call: (tag: string) => void) {
        wx.onShow(() => {
            call('front');
        });
        wx.onHide(() => {
            call('back');
        });
    }

    requestDownload(url: string, option: { method: 'GET' | 'POST'; data?: any }, call: (err, data) => void) {
        wx.request({
            url: url, //仅为示例，并非真实的接口地址
            method: option.method,
            data: option.data,
            header: {
                'content-type': 'application/json' // 默认值
            },
            responseType: 'arraybuffer',
            success(res) {
                console.log(res.data);
                call && call(res.errMsg, res.data);
            }
        });
    }

    private handleDownloadError(url: string, filePath: string, downCount: number, resolve: any, reject: any) {
        this.lwccc();
        downCount++;
        if (downCount >= 3) {
            reject(new Error('Download failed after 3 attempts: ' + url));
            return;
        }
        setTimeout(() => {
            this.downloadFile(url, filePath, downCount).then(resolve).catch(reject);
        }, 1000 * downCount); // Exponential backoff
    }
    //  对于平台下载文件
    async downloadFile(url: string, saveFilePath: string, downCount = 0) {
        return new Promise<string>((resolve, reject) => {
            console.log('downloadFile start:', url, saveFilePath);
            wx.downloadFile({
                url: url, //仅为示例，并非真实的资源
                filePath: saveFilePath,
                success: async res => {
                    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                    if (res.statusCode === 200) {
                        console.log('downloadFile over:', res.tempFilePath);
                        resolve(res.tempFilePath);
                    } else {
                        this.handleDownloadError(url, saveFilePath, downCount, resolve, reject);
                    }
                },
                fail(err) {
                    console.error(err);
                    this.handleDownloadError(url, saveFilePath, downCount, resolve, reject);
                    assetManager.cacheManager?.clearLRU();
                }
            });
        });
    }

    checkNetType(call: (type: string) => void) {
        wx.getNetworkType({
            success(res) {
                call && call(res.networkType);
            }
        });
    }

    requestTriggerGC() {
        wx.triggerGC();
    }

    

}
