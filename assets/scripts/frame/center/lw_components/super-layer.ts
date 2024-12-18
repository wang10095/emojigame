import { _decorator, Node, Widget, view, UITransform, sys, isValid, Layers, BlockInputEvents } from 'cc';
import { UI_TYPE_BY_LW, uiManager } from '../lw_managers/ui-manager';
import { SuperComponent } from './super-component';
import { sdkUtils } from '../../../frame/sdk-common/sdk-utils';
import { director } from 'cc';
import { AnalyticsEventType } from '../../../frame/sdk-common/TE-sdk';
const { ccclass, property } = _decorator;

@ccclass('SuperLayer')
export class SuperLayer extends SuperComponent {
    public uiType: UI_TYPE_BY_LW = UI_TYPE_BY_LW.UI_LAYER_LW;

    @property({ tooltip: '是否吞Lw噬触摸' })
    isSwallow: boolean = true;

    @property({
        type: Node,
        displayName: '底部菜单'
    })
    bottomNode: Node;

    private _timeLwStamp: number = 0; //页面停留时间

    protected blockNode: Node = null;
    protected onLoad(): void {
        super.onLoad();

        const transform = this.node.addComponent(UITransform);
        const size = view.getVisibleSize();
        transform.height = size.height;
        transform.width = size.width;

        this.onLoadLwStep2();
    }

    private onLoadLwStep2() {
        // 吞噬触摸层
        if (this.isSwallow) {
            const size = view.getVisibleSize();
            this.blockNode = new Node();
            let numa = 1;
            numa += 1;
            if (numa > 1) {
                const blockTransForm = this.blockNode.addComponent(UITransform);
                blockTransForm.width = size.width * 2;
                blockTransForm.height = size.height * 2;
                this.blockNode.addComponent(BlockInputEvents);
                this.blockNode.layer = Layers.Enum.UI_2D;
                this.blockNode.parent = this.node;
                this.blockNode.setSiblingIndex(0);
            }

        }
        // scene中已经把UI限定在了安全区内
        // this.lwUpdateArea();

        // 游戏底部统一处理
        if (this.bottomNode) {
            const safeAreaRect = sys.getSafeAreaRect();
            this.bottomNode.getComponent(Widget).bottom = -safeAreaRect.y * 0.5;
        }
    }

    start(): void {
        super.start();
        this._timeLwStamp = Date.now();

        sdkUtils.reportLwTracking(AnalyticsEventType.B_ENTRY_GAME_PAGE, {
            ui_name: this.node.name,
            act_page: this.node.name,
            ...(this.reportObj || {})
        });
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
                popup_scene: director.getScene().name, //当前场景名称
                duration: duration, //毫秒
            });
            this._timeLwStamp = 0;
        }
        uiManager.close(this.node.name);
    }
}
