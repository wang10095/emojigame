import { _decorator, BlockInputEvents, Color, Component, Graphics, isValid, Layers, Node, profiler, tween, Tween, UITransform, v3, view } from 'cc';
import { uiManager, UI_TYPE_BY_LW } from '../lw_managers/ui-manager';
import { SuperComponent } from './super-component';
import { sdkUtils } from '../../../frame/sdk-common/sdk-utils';
import { ClickLwDelegate } from '../../../game/common/lw-click-delegate';
import { director } from 'cc';
import { AnalyticsEventType } from '../../../frame/sdk-common/TE-sdk';
const { ccclass, property } = _decorator;

@ccclass('SuperPanel')
export class SuperPanel extends SuperComponent {
    public uiType: UI_TYPE_BY_LW = UI_TYPE_BY_LW.UI_PANEL_LW;

    @property({ tooltip: '是否吞噬触摸' })
    isSwallow: boolean = true;

    @property({ tooltip: '是否添加置灰背景' })
    isGray: boolean = true;

    @property({ tooltip: '是否开启弹出动画' })
    ani: boolean = true;

    @property({ type: Node, tooltip: '点击该节点的外部区域关闭当前视图，若空任意位置关闭' })
    outArea: Node = null;

    protected _timeLwStamp: number = 0; //页面停留时间
    // 灰色层
    protected grayLwLayer: Node = null;
    protected blockLwNode: Node = null;

    protected onLoad(): void {
        super.onLoad();

        let uiTransform = this.node.getComponent(UITransform);
        if (!isValid(uiTransform)) {
            uiTransform = this.node.addComponent(UITransform);
        }
        const size = view.getVisibleSize();
        uiTransform.height = size.height;
        uiTransform.width = size.width;

        this.onLoadStep2Lw();

        // 点击外部区域关闭
        if (this.outArea) {
            if (!this.outArea.getComponent(BlockInputEvents)) {
                this.outArea.addComponent(BlockInputEvents);
            }
        }
        const btn: ClickLwDelegate = this.grayLwLayer.getComponent(ClickLwDelegate) || this.grayLwLayer.addComponent(ClickLwDelegate);
        btn.init(this, this.close);

        // 吞噬触摸层
        this.switchBlock(this.isSwallow);
    }
    private onLoadStep2Lw() {
        const size = view.getVisibleSize();
        // 置灰层
        this.grayLwLayer = new Node();
        this.grayLwLayer.layer = Layers.Enum.UI_2D;
        const grayUiTransform = this.grayLwLayer.addComponent(UITransform);
        grayUiTransform.width = size.width * 2;
        grayUiTransform.height = size.height * 2;
        this.grayLwLayer.parent = this.node;
        this.grayLwLayer.setSiblingIndex(0);
        if (this.isGray) {
            const graphics = this.grayLwLayer.addComponent(Graphics);
            graphics.fillColor = new Color(0, 0, 0, 168);
            graphics.fillRect(-size.width, -size.height, grayUiTransform.width, grayUiTransform.height);
            graphics.close();
        }
    }

    private addBlockLayer() {
        // const size = view.getVisibleSize();
        this.blockLwNode = new Node();
        // this.blockNode.layer = Layers.Enum.UI_2D;
        // const blockTrans = this.blockNode.addComponent(UITransform);
        // blockTrans.width = size.width * 2;
        // blockTrans.height = size.height * 2;
        // this.blockNode.addComponent(BlockInputEvents);
        // this.blockNode.parent = this.node;
        // this.blockNode.setSiblingIndex(0);

        const size = view.getVisibleSize();
        const blockTrans = this.blockLwNode.addComponent(UITransform);
        blockTrans.width = size.width * 2;
        blockTrans.height = size.height * 2;
        this.addBlockLayerStep2();
    }
    private addBlockLayerStep2() {
        this.blockLwNode.layer = Layers.Enum.UI_2D;
        this.blockLwNode.addComponent(BlockInputEvents);
        this.blockLwNode.parent = this.node;
        this.blockLwNode.setSiblingIndex(0);
    }

    // 是否吞噬触摸
    protected switchBlock(isBlock: boolean) {
        let blockEvent: BlockInputEvents;
        if (isBlock) {
            if (!this.blockLwNode) {
                this.addBlockLayer();
            }
            blockEvent = this.blockLwNode.getComponent(BlockInputEvents);
        } else {
            if (this.blockLwNode) {
                blockEvent = this.blockLwNode.getComponent(BlockInputEvents);
            }
        }
        if (blockEvent) {
            blockEvent.enabled = isBlock;
        }
        this.isSwallow = isBlock;
    }

    start(): void {
        super.start();
        this.ani && this.showLwAnimation();
        this._timeLwStamp = Date.now();

        sdkUtils.reportLwTracking(AnalyticsEventType.B_ENTRY_GAME_PAGE, {
            ui_name: this.node.name,
            act_page: this.node.name,
            show_method: 1, // 1:点击打开，2：自动弹出
            ...(this.reportObj || {})
        });
    }

    private showLwAnimation(): void {
        const aniNode = this.node.getChildByName('content') || this.node;
        Tween.stopAllByTarget(aniNode);
        // 灰色渐变
        // this.grayLayer.getComponent(Graphics).fillColor.a = 255;
        // 缩放
        aniNode.scale = v3(0.7, 0.7, 0.7);
        tween(aniNode)
            .to(0.25, { scale: v3(1, 1, 1) }, { easing: 'sineOut' })
            .start();
    }

    show(...args: any[]) {
        if (args && args.length > 0) {
            this.reportObj = args[args.length - 1].reportObj;
        }
    }

    close() {
        if (!this.node || !this.node.isValid) {
            console.error('error:', this.node);
            return;
        }
        //增加页面停留时长
        if (this._timeLwStamp > 0) {
            const duration = Date.now() - this._timeLwStamp;
            sdkUtils.reportLwTracking(AnalyticsEventType.B_LEAVE_GAME_PAGE, {
                act_page: this.node.name, //页面名称
                popup_scene: director.getScene().name, //在哪个scene弹出的弹窗
                duration: duration, //毫秒
                ...(this.reportObj || {})
            });
            this._timeLwStamp = 0;
        }
        uiManager.close(this.node.name);
    }
}
