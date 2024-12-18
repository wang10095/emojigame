import { _decorator, Component, Event, EventTouch, Node, Touch, Vec2 } from 'cc';
import { LWManager } from '../../frame/center/lw-manager';
const { ccclass, property } = _decorator;

@ccclass('ClickLwDelegate')
export class ClickLwDelegate extends Component {
    private isClick: boolean = undefined;
    private func: any = undefined;
    private args: any = undefined;

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.lwAddTouchEventListeners();
    }

    init(target: any, func: any, ...args: any[]) {
        this.func = target ? func.bind(target) : func;

        this.args = args;
    }

    private lwAddTouchEventListeners() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: EventTouch) {
        const touches = event.getTouches();
        this.isClick = touches.length === 1;

        // 播放音效
        LWManager.lwaudioManager.playAudio(null, 'S_ClickButton');
    }

    private onTouchMove(event: EventTouch) {
        if (!this.isClick) {
            return;
        } else {
            const touches = event.getTouches();
            if (touches.length > 1) {
                this.isClick = false;
            } else {
                this.onTouchMoveStep2(touches);
            }
        }

    }

    private onTouchMoveStep2(touches: Touch[]) {
        const firstTouch = touches[0];
        const deltaLoc: Vec2 = firstTouch.getDelta();
        if (Math.abs(deltaLoc.x) > 10 || Math.abs(deltaLoc.y) > 10) {
            this.isClick = false;
        }
    }

    private onTouchEnd() {
        if (!this.isClick) {
            return;
        }

        if (this.func) {
            this.func(...this.args);
        }
    }

    private onTouchCancel() { }
}
