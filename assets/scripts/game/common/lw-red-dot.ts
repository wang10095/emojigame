import { _decorator, Component, Node, Sprite, Label, Enum, CCString } from 'cc';
import { SuperComponent } from '../../frame/center/lw_components/super-component';
import { LWManager} from '../../frame/center/lw-manager';
import { redLwDotManager } from '../../frame/center/lw_managers/lw-red-dot-manager';
const { ccclass, property } = _decorator;

export enum RED_DOT_KEY {
    DEFAULT = 'default',
   
}

@ccclass('RedDotByLw')
export class RedDotByLw extends SuperComponent {
    @property({
        tooltip: '标签'
    })
    key = RED_DOT_KEY.DEFAULT;

    @property({
        displayName: '展示数字'
    })
    showNum: boolean = false;

    @property({
        type: Sprite,
        displayName: '红点图'
    })
    redIcon: Sprite;

    @property({
        type: Label,
        tooltip: '数字展示',
        visible: function (this) {
            return this.showNum;
        }
    })
    num: Label;

    private redDotKeyByLw: string;

    onLoad() {
        this.redDotKeyByLw = this.key;
        this.redIcon.node.active = false;
        if (this.redDotKeyByLw == null) {
            return;
        }
        this.addRedDotKeyEventByLw();
    }

    refresh(key: string) {
        LWManager.lweventManager.off('RedDot_' + this.redDotKeyByLw, this);
        //this.redDotKeyByLw = key || this.redDotKeyByLw;
        if(key){
            this.redDotKeyByLw = key;
        }else{
            this.redDotKeyByLw = this.redDotKeyByLw;
        }
        if (this.redDotKeyByLw == null) {
            return;
        }
        this.addRedDotKeyEventByLw();
    }

    private addRedDotKeyEventByLw() {
        LWManager.lweventManager.on(
            'RedDot_' + this.redDotKeyByLw,
            (num: number | boolean) => {
                this.resetView(num);
            },
            this
        );

        this.resetView(redLwDotManager.getRedDotStatus(this.redDotKeyByLw));
    }

    // 红点刷下
    resetView(num: number | boolean) {
        // if (typeof num === 'boolean') {
        //     this.redIcon.node.active = num;
        // } else {
        //     this.redIcon.node.active = false;
        //     this.num.node.active = true;
        //     if (this.showNum) {
        //         if (num === 0) {
        //             this.num.string = '';
        //         } else if (num > 0 && num < 100) {
        //             this.num.string = num.toString();
        //         } else if (num >= 99) {
        //             this.num.string = '99+'; //TODO: 已和策划确认 所有数字显示超过99都是99+
        //         }
        //         this.redIcon.node.active = num > 0 ? true : false;
        //     } else {
        //         this.num.string = '';
        //     }
        // }

        if (typeof num === 'number') {
            this.redIcon.node.active = false;
            this.num.node.active = true;
            if (this.showNum) {
                if (num === 0) {
                    this.num.string = '';
                } else if (num > 0 && num < 100) {
                    this.num.string = num.toString();
                } else if (num >= 99) {
                    this.num.string = '99+'; //TODO: 已和策划确认 所有数字显示超过99都是99+
                }
                this.redIcon.node.active = num > 0 ? true : false;
            } else {
                this.num.string = '';
            }
        } else {
            this.redIcon.node.active = num;
        }
    }
}
