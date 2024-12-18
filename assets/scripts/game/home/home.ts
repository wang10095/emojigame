import { _decorator, Node, Label, UITransform, find, Color, view, Widget, v3, sys, Sprite, isValid, UIOpacity, director, tween } from 'cc';
import { SuperScene } from '../../frame/center/lw_components/super-scene';
import { LWManager } from '../../frame/center/lw-manager';
import { UI_TYPE_BY_LW, uiManager } from '../../frame/center/lw_managers/ui-manager';
import { DataManager } from '../data/data-manager';
import { UI_LW_EVENT_NAME, UI_NAME } from '../constant/lw-common-define';
import { ToastLw } from '../../frame/center/lw_components/lw-toast';
import { SuperSpine } from '../../frame/center/lw_components/super-spine';
import { getGlobalCfgValue } from '../common';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import ScrollReuse from '../../frame/center/lw_components/scroll-endless';
import { gotoLWScene } from '../ui-commonset';
import { isDebugTest } from '../lw-game-define';
const { ccclass, property } = _decorator;

@ccclass('home')
export class home extends SuperScene {
    @property({
        type: Node,
        tooltip: '顶部区域'
    })
    topNode: Node;

    @property({
        type: Node,
        tooltip: '背景节点'
    })
    bgNode: Node;

    @property({
        type: Node,
        tooltip: '中间区域'
    })
    centerNode: Node;

    @property({
        type: Label
    })
    labFreeCount: Label = null;

    @property({
        type: Node
    })
    btnAds: Node = null;

    @property({
        type: Label,
        tooltip: '通关的总人数'
    })
    labPassCount: Label = null;


    @property({
        type: Node,
        tooltip: '',
    })
    nodeScrollView: Node = null;


    _hadFreeCount: number = 0;

    onLoad(): void {
        super.onLoad();
        DataManager.dataBattle.curStage = 1;
        DataManager.dataBattle.curLittleStage = 1;
        DataManager.currentSceneName = 'home';
    }

    start() {
        super.start();
        const viewSize = view.getVisibleSize();
        // 远超设计分辨率的长屏幕，将多余的长度分： 顶 底和中间娃娃机 均分，防止上下区域过大
        const safeArea = sys.getSafeAreaRect();
        console.log('LWsafearena:', safeArea, safeArea.y, safeArea.height);
        console.log('LWheight:', viewSize.height - safeArea.y);
        viewSize.height -= safeArea.y;

        // this.node.getChildByName('bottom').getComponent(Widget).bottom = -safeArea.y * 0.5;
        // 刷新widget的位置
        // this.scheduleOnce(() => {
        //     this.centerNode.children.forEach((childNode, idx) => {
        //         childNode.getComponent(Widget)?.updateAlignment();
        //         if (idx === 0) {
        //             childNode.children.forEach(sunChildNode => {
        //                 sunChildNode.getComponent(Widget)?.updateAlignment();
        //             });
        //         }
        //     });
        // });

        this.LWRegisterMyEmit(
            [

            ],
            [

            ],
            this
        );

        // 展示玩家属性
        this.registerGuideButtonEven();
        const startTime = Date.now();
        console.log('home start', startTime);
        // 加载battle模块
        if (DataManager.dataLwPlayer.isFirstEnter) {  //首次进入预加载battle
            // 首次进入游戏后请求数据
            // if (DataManager.dataTask.isInit) {
            //     this.startGameRequest();
            // }
            DataManager.dataLwPlayer.isFirstEnter = false;
            //添加背景音乐s
            LWManager.lwaudioManager.playMusicLw('S_BGmusic');
        } else {
            this.initGameData(false);
            // 当前待处理装备
            // LWManager.lwaudioManager.playMusicLw('S_BGmusic');
        }

        // 提前加载广告
        // preCreateRewardedVideoAds();

        this.initUI();
    }

    initUI() {

        // lwUtils.storage.setItem('game_play_count', 3000 + '');    //test

        const gamePassAllCount = this.getAllPassCount();
        this.labPassCount.string = gamePassAllCount + '';


        this.checkFreeCount();

        this.nodeScrollView.getComponent(ScrollReuse).initView(Object.values(Config.City), 3);
    }

    //检查免费次数
    checkFreeCount() {
        const freeCount: number = Number(getGlobalCfgValue('gameFreeCount'));

        const lastPlayTime = lwUtils.storage.getItem('game_play_time');
        const playCount = lwUtils.storage.getItem('game_play_count');
        this._hadFreeCount = 0;
        if (playCount && lastPlayTime) {
            const date = Date.now();
            const isSameDay = lwUtils.time.isSameDay(date, Number(lastPlayTime));
            if (!isSameDay) {
                lwUtils.storage.setItem('game_play_count', freeCount + '');
                this._hadFreeCount = 3;
            } else {
                this._hadFreeCount = Number(playCount);
            }
        } else {
            lwUtils.storage.setItem('game_play_count', freeCount + '');
            lwUtils.storage.setItem('game_play_time', Date.now() + '');
            this._hadFreeCount = 3;
        }

        this.btnAds.active = this._hadFreeCount === 0;

        this.setFreeCount();
    }

    goShowAds() {
        uiManager.show(UI_NAME.AdsShowPanel, () => {
            this._hadFreeCount++;
            this.setFreeCount();
            lwUtils.storage.setItem('game_play_count', this._hadFreeCount + '');
            lwUtils.storage.setItem('game_play_time', Date.now() + '');

            this.btnAds.active = false;

            this.onClickBattle();
        });
    }

    async onClickBattle() {

        if (this._hadFreeCount <= 0) {
            this.goShowAds();
            return;
        }

        this._hadFreeCount--;
        lwUtils.storage.setItem('game_play_count', this._hadFreeCount + '');
        lwUtils.storage.setItem('game_play_time', Date.now() + '');

        //跳转战斗场景
        gotoLWScene('battle', true, [
            'word_change_caihong', 'word_random_caihong', 'skill_boom', 'skill_transform_random'
        ]);

    }

    private showTipGuide() {
        // 间隔 N s 无操作则显示提示点击小手
        const hasShowPanels = uiManager.checkHasShowUIType([UI_TYPE_BY_LW.UI_LAYER_LW, UI_TYPE_BY_LW.UI_PANEL_LW, UI_TYPE_BY_LW.UI_POPUP_LW, UI_TYPE_BY_LW.UI_ALERT_LW]);
    }

    // 点击主城隐藏新手引导
    private hideTipGuide() {

    }

    // 新手引导节点注册监听事件
    private registerGuideButtonEven() {
        // if (DataManager.dataGuide.guideIsOver()) {
        //     return;
        // }
        // const taskButtonNode = find('Canvas/bottom/task_item/shanguang/item_icon');
        // taskButtonNode.off(UI_LW_EVENT_NAME.GUIDE_CLICK_EVENT);
        // taskButtonNode.on(UI_LW_EVENT_NAME.GUIDE_CLICK_EVENT, () => {
        //     taskButtonNode.parent.parent.getComponent(TaskItem).onBtnClicTask();
        // })
    }

    // 初始化游戏数据，在start中可能由于消息下发慢 不初始化
    initGameData(isFrirstEnter: boolean = true) {
        // this.refreshCoinNum(this.labDiamond, ITEM_ID.DIAMOND);
    }

    // 进入游戏后的请求  //家园 探索 宠物 精灵  有解锁判定
    private startGameRequest() {
        // ------ 刷新属性,所有属性刷新 --------- 保持我在最后 作为从后端获取数据完成的标志
        // DataManager.dataEquip.requestCollectionStatus();
    }

    update(deltaTime: number) { }

    onClickSet() {
        uiManager.show(UI_NAME.SetPanel);
    }

    onDestroy(): void {
        super.onDestroy();
    }

    setFreeCount() {
        const freeCount: number = Number(getGlobalCfgValue('gameFreeCount'));
        this.labFreeCount.string = `今日免费${this._hadFreeCount}/${freeCount}`;
    }

    onClickInvite() {
        ToastLw.showLwToast('敬请期待');

    }
    onClickCollection() {
        ToastLw.showLwToast('敬请期待');
    }

    onClickLocation() {
        ToastLw.showLwToast('敬请期待');
    }

    onClickRank() {
        ToastLw.showLwToast('敬请期待');
    }

    getAllPassCount() {
        let count = 0;
        for (const rankId in Config.City) {
            const value = Config.City[rankId];
            count += value.passNumber;
        }
        return count;
    }

}
