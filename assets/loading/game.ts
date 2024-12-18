import { _decorator, Component, director, game, gfx, macro, Node, screen, view } from 'cc';
import { LWManager } from '../scripts/frame/center/lw-manager';
import { SuperComponent } from '../scripts/frame/center/lw_components/super-component';
import { UI_LW_EVENT_NAME, UI_NAME } from '../scripts/game/constant/lw-common-define';
import { sdkUtils } from '../scripts/frame/sdk-common/sdk-utils';
import { isMiniGame } from '../scripts/game/lw-game-define';
import { DataManager } from '../scripts/game/data/data-manager';
import lwUtils from '../scripts/frame/center/lw_utils/lw-utils';
import { uiManager } from '../scripts/frame/center/lw_managers/ui-manager';
import { AnalyticsEventType } from '../scripts/frame/sdk-common/TE-sdk';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends SuperComponent {
    private _passTime = 0;

    private lwReportGapTime = 60;
    private _currentPassReportTime = 0;
    private gameRunStartTime = 0;

    // currentSceneName = 'home';
    // private cacheWaitingGuideStep: { stepId: number; isForce: boolean }; // 等待转场的引导步骤

    onLoad() {
        director.addPersistRootNode(this.node);
        LWManager.init(this.node);
        this.LWRegisterMyEmit(
            [
                'MemoryWarning',
                UI_LW_EVENT_NAME.GAME_ERROR_BY_LW,
                UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE_PRE,
                UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE,
                UI_LW_EVENT_NAME.GAME_EXIT
            ],
            [
                res => {
                    // 内存预警汇报
                    LWManager.lwbundleManager.removeLRUBundlesLw();
                    sdkUtils.reportLwTracking(AnalyticsEventType.GAME_MEMORY_WARNING, { level: res?.level });
                    // ToastLw.showToast('===内存报警==')
                },
                this.lwreportGameError,
                this.preSwitchScene,
                this.switchScene,
                this.gameExit
            ],
            this
        );
        console.log('lwgame onLoad B_ENTRY_PAGE');

        this.gameRunStartTime = Date.now();
        game.on(
            'game_on_pause',
            () => {
                LWManager.lwaudioManager.pause();
                LWManager.lwtimeManager.pause();
            },
            this
        );
        game.on(
            'game_on_resume',
            () => {
                LWManager.lwaudioManager.resume();
                LWManager.lwtimeManager.resumeByLw();
                if (isMiniGame) {
                    sdkUtils.keepGameScreenOn();
                }
            },
            this
        );
        game.on('game_on_close', () => { }, this);
    }

    start() {
        this.adaptScreen();
    }

    private adaptScreen() {
        const viewSize = screen.windowSize; //view.getVisibleSize();
        const designSize = view.getDesignResolutionSize();
        console.log(designSize);
        console.log(viewSize);
        const designRatio = designSize.width / designSize.height;
        const viewRatio = viewSize.width / viewSize.height;
        console.log(designRatio);
        console.log(viewRatio);

        // if (viewRatio > 0.6) {
        //     // 宽高比大 认为ipad屏幕   3
        //     view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_HEIGHT);
        // } else {   //  4
        //     view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_WIDTH);
        // }
    }

    // 获取道具展示
    private showReceiveItems(
        uiName: string,
        changeItems:
            | { [id: number]: number }
            | {
                id?: number;
                count?: number;
            }[],
        autoClose = false,
        autoDur?: number
    ) {
        let showItems = changeItems;
        if (lwUtils.utils.isArray(changeItems)) {
            showItems = lwUtils.utils.itemDatasToItemMap(
                changeItems as {
                    id?: number;
                    count?: number;
                }[]
            );
        }
        uiManager.show(uiName, showItems, autoClose, autoDur);
    }

    // 触发新手引导大步骤
    private showGuide() {
        // uiManager.show(UI_NAME.Guide);
    }

    // 剧情步骤
    private showStoryStep(storyId: number, steps: number[]) {
        // uiManager.show(UI_NAME.StoryPanel, storyId, steps);
    }

    // 准备切换场景
    private preSwitchScene() {
        // if (DataManager.dataEquip) {
        //     DataManager.dataEquip.isAutoing = false;
        // }
    }

    // 切换场景结束
    private switchScene(sceneName: string) {
        DataManager.currentSceneName = sceneName;
        // const sceneWaitGuideIds = DataManager.dataGuide.getSceneGuideIds();
        // if (sceneWaitGuideIds && Object.keys(sceneWaitGuideIds).length > 0) {
        //     this.showGuide();
        // }
        // this.autoEquipChangeScene();
        sdkUtils.requestTriggerGC();
    }

    // 退出游戏
    private gameExit() {
        uiManager.clear();
        director.loadScene('loading');
    }

    private lwreportGameError(message: any, err: Error, ...optionalParams: any[]) {
        let argMessage = '';
        let lwargMessage = '';
        if (err) {
            lwargMessage += err.message + err.name + err.stack;
        }

        if (optionalParams) {
            optionalParams.forEach(param => {
                param = JSON.stringify(param);
                argMessage = argMessage + ',' + param;
            });
        }
        argMessage += lwargMessage;

        sdkUtils.reportLwTracking(AnalyticsEventType.GAME_ERROR_BY_LW, {
            error: message + ':' + argMessage
        });
        if (err?.name.startsWith('memory access out') || err?.message.startsWith('memory access out')) {
            LWManager.lwbundleManager.removeLRUBundlesLw();
        }
    }

    protected onDestroy(): void {
        console.log('game onDestory B_LEAVE_PAGE');
    }

    update(deltaTime: number) {
        this._passTime += deltaTime;
        if (this._passTime >= 0.2) {
            LWManager.lwtimeManager.update(0.2);

            this._passTime -= 0.2;
            this._currentPassReportTime += 0.2;
            this.gametsUpdataStep2();
        }
    }

    protected gametsUpdataStep2() {
        if (this._currentPassReportTime >= this.lwReportGapTime) {
            //上报游戏时长
            sdkUtils.reportLwTracking(AnalyticsEventType.B_LEAVE_PAGE, {
                act_page: 'game', //页面名称
                duration: this.lwReportGapTime * 1000 //Date.now() - this.gameRunStartTime
            });
            this._currentPassReportTime = 0;
        }
    }
}
