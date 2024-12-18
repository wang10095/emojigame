

import { Node, _decorator, tween } from 'cc';
import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { UI_LW_EVENT_NAME, UI_NAME } from '../constant/lw-common-define';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { FailType } from './battle';
import { uiManager } from '../../frame/center/lw_managers/ui-manager';
import { ToastLw } from '../../frame/center/lw_components/lw-toast';
import { isDebugTest } from '../lw-game-define';

const { ccclass, property } = _decorator;

@ccclass('AdsShowPanel')
export class AdsShowPanel extends SuperPanel {
    @property({
        type: [Node],
        tooltip: ''
    })
    nodeTitle: Node[] = [];

    _callback = null;

    show(callback): void {
        this._callback = callback;
    }

    protected onLoad(): void {
        super.onLoad();
    }

    start(): void {
        super.start();

        let count = 1;

        this.nodeTitle.forEach((node) => {
            node.active = false;
        })

        this.nodeTitle[0].active = true;

        if (isDebugTest) {
            this.scheduleOnce(() => {
                this.pushEmit();
            }, 0.5);
        } else {

            this.schedule(() => {
                this.nodeTitle.forEach((node) => {
                    node.active = false;
                })
                console.log('======count============', count)
                if (count < this.nodeTitle.length) {
                    this.nodeTitle[count].active = true;
                }

                count++;

                if (count > this.nodeTitle.length) {

                    this.pushEmit();
                    this.unscheduleAllCallbacks();
                }

            }, 1, 2)
        }
    }


    pushEmit() {
        this.close();

        if (this._callback) {
            this._callback();
            this._callback = null;
        }

    }

}