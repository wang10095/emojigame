import { _decorator, Component, Node } from 'cc';
import { SuperSdk } from './super-sdk';

import { i18n } from '../../frame/center/lw_managers/lw-language-manager';
import { LWManager } from '../../frame/center/lw-manager';
const { ccclass, property } = _decorator;

@ccclass('super_wechat_LwSdk')
export class super_wechat_LwSdk extends SuperSdk {
    protected optionsLwSync: any;
    protected gameSystemLwInfo: any;
    protected useInfoLwData: any;

    constructor() {
        super();
        wx.onMemoryWarning(res => {
            console.log('onMemoryLwWarning:', res);
            this.requestTriggerGC();
            LWManager.lweventManager.emitLw('MemoryLwWarning', res);
        });
    }

    // 新版本检测 其实仅仅是监听 微信小游戏的机制是每次玩家启动（热启动和冷启动）都会主动触发检查
    checkHaveNewVersion() {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log('load new version success!');
            console.log(res.hasUpdate);
            if (res.hasUpdate) {
            }
        });
        this.checkHaveNewVersionStep2();
    }

    private checkHaveNewVersionStep2() {
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                }
            });
        });

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            console.log('load new version faild!');
        });
    }

    // 游戏包信息
    getLwGamePackageInfo() {
        const packageInfo = {};
        //小程序类型
        packageInfo['app_type'] = 'wechat';
        //小程序包名
        packageInfo['package_name'] = 'com.qqemoji.game' + 'wx';
        //游戏版本号
        packageInfo['game_version'] = getGameGlobal().gameVersion;
        //策划配置版本号
        packageInfo['config_version'] = getGameGlobal().configVersion;
        //oss对于的channel名称
        packageInfo['channel_name'] = 'wechatgame';
        return packageInfo;
    }

    showToast(des: string) {
        wx.showToast({
            title: des,
            icon: 'none'
        });
    }

    // 登录接口
    login(call: (code: any) => void) {
        wx.login({
            success(res) {
                call && call(res);
            }
        });
    }

    // 用户隐私
    requireUserPrivacy() {
        // 调用wx.requirePrivacyAuthorize拉起弹窗组件
        // 若用户已同意且隐私政策无变更则直接跳过用户确认阶段进入success回调，否则需要拉起隐私弹窗，请求用户确认，用户同意后才进入success回调
        wx.requirePrivacyAuthorize({
            success: res => {
                // 非标准API的方式处理用户个人信息
            },
            fail: () => { },
            complete: () => { }
        });
    }

    // 获取用户信息
    getUserInfo(callBack: (res: any) => void) {
        if (!this.useInfoLwData) {
            const self = this;
            // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
            if (wx.getUserProfile) {
                wx.getUserProfile({
                    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                    success: res => {
                        self.useInfoLwData = res.userInfo;
                        callBack && callBack(res.userInfo);
                    },
                    fail: res => {
                        callBack && callBack(null);
                    }
                });
            }
        } else {
            callBack && callBack(this.useInfoLwData);
        }
    }

    getUserInfoSync() {
        return this.useInfoLwData;
    }

    copyText(txt: string) {
        console.log('copyText:', txt);
        wx.setClipboardData({
            data: txt,
            success(res) {
                console.log('copy res:', txt);
            }
        });
    }

    // 上报数据
    reportScene(sceneId: number, costTime: number) {
        wx.reportScene({
            sceneId: sceneId, //「必填」sceneId 为「新建场景」后，由系统生成的场景 Id 值，用于区分当前是哪个启动场景的数据
            costTime: costTime, //「非必填」costTime 为当前场景的耗时(ms)，非必填，默认为 0
            dimension: {
                d1: 'test' //「非必填」value仅支持传入String类型。若value表示Boolean，请将值处理为0、1进行上报；若value为Number，请转换为String进行上报
            },
            success(res) {
                // 上报接口执行完成后的回调，用于检查上报数据是否符合预期，也可通过启动调试能力进行验证
                // console.log(res);
            },
            fail(res) {
                // 上报报错时的回调，用于查看上报错误的原因：如参数类型错误等
                // console.log(res);
            }
        });
    }

    // 获取归因
    getOptionsSync() {
        if (!this.optionsLwSync) {
            if (wx.getLaunchOptionsSync) {
                this.optionsLwSync = wx.getLaunchOptionsSync();
            } else if (wx.getEnterOptionsSync) {
                this.optionsLwSync = wx.getEnterOptionsSync();
            }
        }
        return this.optionsLwSync;
    }

    // 设备信息
    getSystemInfoSync() {
        if (!this.gameSystemLwInfo) {
            this.gameSystemLwInfo = wx.getSystemInfoSync();
        }
        return this.gameSystemLwInfo;
    }

    // 联系GM
    connectGM() {
        // ToastLw.showToast('暂未开启，敬请期待');
        wx.openCustomerServiceConversation({
            success(res) {
                console.log('打开客服成功');
            },
            fail(res) {
                console.log('打开客服失败');
            }
        });
        console.log('联系wechat客服');
    }

    // ---------- 文件处理 ---------------

    // 判断是否存在文件
    isExistFile(filePath: string): boolean {
        try {
            wx.getFileSystemManager().accessSync(filePath);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 用户目录
    writeFile(fileName: string, content: string): boolean {
        // 在本地用户文件目录下创建一个文件 hello.txt，写入内容 "hello, world"
        try {
            const fs = wx.getFileSystemManager();
            fs.writeFileSync(fileName, content, 'utf8');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // 复制文件
    copyFile(srcPath: string, distPath: string): boolean {
        try {
            wx.getFileSystemManager().copyFileSync(srcPath, distPath);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // 创建文件路径
    mkDir(dirPath: string): boolean {
        try {
            wx.getFileSystemManager().mkdirSync(dirPath, true);
            return true;
        } catch (e) {
            return false;
        }
    }

    rmDir(dirPath: string): boolean {
        try {
            wx.getFileSystemManager().rmdirSync(dirPath, true);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 读取文件
    readFile(filePath: string): string | ArrayBuffer {
        try {
            const res = wx.getFileSystemManager().readFileSync(filePath, 'utf8', 0);
            console.log(res);
            return res;
        } catch (e) {
            console.error(e);
        }
        return '';
    }

    // 解压文件
    async unzipFile(zipPath: string, targetPath: string) {
        console.debug('正在解压文件', zipPath, targetPath);
        return new Promise<void>((resolve, reject) => {
            wx.getFileSystemManager().unzip({
                zipFilePath: zipPath,
                targetPath: targetPath,
                success: res => {
                    console.debug('文件解压成功', zipPath, targetPath, res);
                    resolve();
                },
                fail: res => {
                    console.error('文件解压失败', zipPath, targetPath, res);
                    reject(res);
                }
            });
        });
    }

    // 删除文件
    deleteFile(filePath: string): boolean {
        try {
            const res: any = wx.getFileSystemManager().unlinkSync(filePath);
            if (res) {
                console.log(res);
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    onShareAppMessage(call: (res: any) => void) {
        wx.onShareAppMessage(call);
    }

    showShareMenu() {
        wx.showShareMenu({
            withShareTicket: false, //如果需要转发到的群的信息时开启，true时转发的卡片不可再次转发
            menus: ['shareAppMessage'] //shareTimeline
        });
    }

    protected lwccc() {
        let num = 0;
        num += 1;
        num += 2;
        return num;
    }
}


