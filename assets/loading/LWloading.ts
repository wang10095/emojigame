// ----------- 1.60 上线
import { _decorator, assetManager, director, DynamicAtlasManager, EditBox, EPhysics2DDrawFlags, game, JsonAsset, Label, log, macro, Node, PhysicsMaterial, PhysicsSystem2D, profiler, Sprite, sys, UITransform, v2, view } from 'cc';
import { sdkUtils } from '../scripts/frame/sdk-common/sdk-utils';
import { gameModel, isBrowser, isMiniGame } from '../scripts/game/lw-game-define';
import lwUtils from '../scripts/frame/center/lw_utils/lw-utils';
import { UI_LW_EVENT_NAME } from '../scripts/game/constant/lw-common-define';
import { ToastLw } from '../scripts/frame/center/lw_components/lw-toast';
import { SuperScene } from '../scripts/frame/center/lw_components/super-scene';
import { LWManager } from '../scripts/frame/center/lw-manager';
import { DataManager } from '../scripts/game/data/data-manager';
import { redLwDotManager } from '../scripts/frame/center/lw_managers/lw-red-dot-manager';
import { Widget } from 'cc';
import { ExcelConfigParser } from '../scripts/game/excel-config-parser';
import { gotoLWScene } from '../scripts/game/ui-commonset';
const { ccclass, property } = _decorator;

@ccclass('loading')
export class loading extends SuperScene {
    @property({
        type: Node,
        // //displayName: '登陆节点'
    })
    loginNode: Node;

    @property({
        type: Node,
        //displayName: '加载节点'
    })
    loadingNode: Node;

    // @property({
    //     type: Node,
    //     //displayName: '选择服务器节点'
    // })
    // serverNode: Node;

    @property({
        type: Label,
        //displayName: '加载进度'
    })
    progressLabel: Label;

    @property({
        type: Label,
        //displayName: '加载描述'
    })
    progressTip: Label;

    @property({
        type: Label,
        //displayName: '游戏版本'
    })
    gameVersionLab: Label;

    @property({
        type: Sprite,
        //displayName: '加载进度'
    })
    progressBar: Sprite;

    @property({
        type: Sprite,
        //displayName: '进度tab图标'
    })
    progressIcon: Sprite;


    @property({
        type: Label,
        //displayName: '玩家id'
    })
    playerUID: Label;

    @property({
        type: Node,
        //displayName: '错误弹出'
    })
    errorNode: Node;

    @property({
        type: Label,
        //displayName: '错误输出'
    })
    errorMsg: Label;

    @property({
        type: Node,
        //dissName: '公告按钮'
    })
    noticeNode: Node;

    //是否是微信平台
    private isWechat = sys.platform === sys.Platform.WECHAT_GAME || sys.platform === sys.Platform.WECHAT_MINI_PROGRAM;
    //是否是抖音平台
    private isByDance = sys.platform === sys.Platform.BYTEDANCE_MINI_GAME;

    private isNative = sys.platform === sys.Platform.ANDROID || sys.platform === sys.Platform.IOS;

    private alertCall: () => void;
    onLoad(): void {
        super.onLoad();
        game.frameRate = 60;  //设置帧率60
        assetManager.downloader.maxConcurrency = 40; //下载的最大并发连接数

        macro.CLEANUP_IMAGE_CACHE = true;
        DynamicAtlasManager.instance.enabled = false; //关闭动态合图 

        // macro.ENABLE_MULTI_TOUCH = false;//多点触摸
        this.lwUpdateArea();
        this.setBgScale();
        this.configPhy(); //设置box2d

        const safeArea = sys.getSafeAreaRect();
        this.node.getChildByName('bottom').getComponent(Widget).bottom = -safeArea.y;
    }

    configPhy() {
        macro.ENABLE_MULTI_TOUCH = false;
        PhysicsSystem2D.instance.enable = true;

        //物理调试信息
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
            EPhysics2DDrawFlags.Pair |
            EPhysics2DDrawFlags.CenterOfMass |
            EPhysics2DDrawFlags.Joint |
            EPhysics2DDrawFlags.Shape;

        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.None; //关闭绘制调试信息

        // 默认的重力加速度是 (0, -10) 米/秒2，按照上面描述的转换规则，即 (0, -320) 世界单位/秒2。
        PhysicsSystem2D.instance.gravity = v2(0, -320);

        const system = PhysicsSystem2D.instance;
        system.fixedTimeStep = 1 / 60; //物理步长 默认1/60
        system.velocityIterations = 10; //每次更新物理系统的迭代次数 默认为10
        system.positionIterations = 10; //每次更新物理系统处理的迭代次数 默认为10
        system.maxSubSteps = 3; //每步模拟的最大子步数
    }

    private setBgScale() {
        const lwbgNode = this.node.getChildByName('bg');
        const lwbgSize = lwbgNode.getComponent(UITransform).contentSize;
        const lwwScale = view.getVisibleSize().width / (lwbgSize.width || 750);
        const lwhScale = view.getVisibleSize().height / (lwbgSize.height || 1624);
        const lwmaxScale = Math.max(lwwScale, lwhScale);
        lwbgNode.setScale(lwmaxScale, lwmaxScale, 0);
    }
    private perStart() {
        // profiler.showStats();
        this.targetOffEvent();
        this.LWRegisterMyEmit(
            [UI_LW_EVENT_NAME.GAME_WIN_LW_CLOSE],
            [
                (uiName: string) => {
                    if (uiName === 'notice_panel') {
                        // TODO
                        // LoginService.getInstance().gameNoticeStatus = 'closed';
                        this.goHomeScene();
                    }
                },
            ],
            this
        );

        // SocketIo.clear();
        lwUtils.storage.setGlobalStorageKey(''); //清空id的key前缀
        // sdkUtils.checkHaveNewVersion();



        this._timeStamp = Date.now();
        // 本地缓存版本
        let localConfigVersion = sys.localStorage.getItem('LW_config_version');
        if (!localConfigVersion) {
            localConfigVersion = '0';
        }
        getGameGlobal().configVersion = localConfigVersion;

        this.gameVersionLab.string = 'Lw游戏版本：v' + getGameGlobal().gameVersion;

        if (isMiniGame) { //小游戏登录按钮
            this.loginNode.getChildByName('wechat').active = false;
            this.loginNode.getChildByName('normal').active = false;
            sdkUtils.keepGameScreenOn();
        } else {
            this.loginNode.getChildByName('wechat').active = false;
            this.loginNode.getChildByName('normal').active = true;
        }

        this.progressIcon.node.setPosition(0, 0);
        this.progressBar.fillRange = 0;
    }
    async start() {

        this.perStart();
        const commonBundle = await LWManager.lwbundleManager.loadLwBundle('common');
        this.setPercentProgress(0.3);
        const model = await LWManager.lwbundleManager.loadLwBundle('model');
        this.setPercentProgress(0.5);
        const modelBunndle = await LWManager.lwbundleManager.loadLwBundle('config');
        this.setPercentProgress(0.7);
        const homeBundle = await LWManager.lwbundleManager.loadLwBundle('home');
        this.setPercentProgress(1.0);
        this.progressTip.string = '加载完成';

        ExcelConfigParser.getInstance().initConfig();
        DataManager.create();
        redLwDotManager.clear();
        // TESdk.getInstance().init();//打点初始化
        if (isMiniGame) {
            const res: any = await sdkUtils.login();
            if (!res) {
                // this.showServerError('请求微信用户信息失败，请检查当前网络状态', this.start);
                console.error('res null');
                return;
            }
            if (res.code) {
                console.log('=========微信lw登录成功============', res.code);
                lwUtils.storage.setGlobalStorageKey(res.code);
                this.loginNode.getChildByName('wechat').active = true;
            } else {
                console.error('lw未获取到usercode：', res.code);
            }
        } else {

            lwUtils.storage.setGlobalStorageKey('12345678#');

        }

    }

    setPercentProgress(percent: number) {
        if (percent > 1.0) {
            percent = 1.0;
        }
        this.progressIcon.node.setPosition(469 * percent, 0);
        this.progressBar.fillRange = percent;
    }

    // web 点击登录按钮
    private async webRequestUserInfo() {
        this.goHomeScene();
        return;
    }

    // 服务器接口暂未开放
    private showServerError(msg: string, call: () => void) {
        this.errorNode.active = true;
        this.errorMsg.string = msg;
        this.alertCall = call;
    }

    // private hideServerError() {
    //     this.errorNode.active = false;
    //     if (this.alertCall) {
    //         this.alertCall();
    //     }
    // }

    // 登陆
    private async requestGameLogin() {
        this.goHomeScene();
        return;
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        super.onDestroy();
        this.unscheduleAllCallbacks();
        this.alertCall = null;
    }

    // 清除缓存资源
    private clearCache() {
        assetManager.cacheManager?.clearCache();

        // 移除配置信息
        // const configSavePath = `${this.getUserDataFolder()}/${ExcelConfigParser.getInstance().getConfigPath()}/`;
        // if (sdkUtils.isExistFile(configSavePath)) {
        //     sdkUtils.rmDir(configSavePath);
        // }
        sdkUtils.resetartLwMiniGame(); //重起游戏

        lwUtils.storage.clear();

        // sdkUtils.reportLwTracking(AnalyticsEventType.GAME_ERROR_BY_LW, {
        //     error: 'clear Cache!!'
        // });
    }

    // 用户可操作文件夹
    private getUserDataFolder() {
        if (this.isWechat) {
            return wx.env.USER_DATA_PATH;
        } else if (this.isByDance) {
            return tt.env.USER_DATA_PATH;
        }
    }


    //进入home界面
    private async goHomeScene() {
        // if (LoginService.getInstance().gameNoticeStatus === 'closed' && this.requestLoginSucces) {
        if (this.progressBar.fillRange >= 1.0) {
            director.loadScene('home', () => {
                director.loadScene('home');
            });
        } else {
            ToastLw.showLwToast('资源加载中...');
        }

        // }
    }

}
