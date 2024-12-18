

import { Label, Node, _decorator } from 'cc';
import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { UI_LW_EVENT_NAME, UI_NAME } from '../constant/lw-common-define';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { FailType } from './battle';
import { uiManager } from '../../frame/center/lw_managers/ui-manager';
import { ToastLw } from '../../frame/center/lw_components/lw-toast';
import { getGlobalCfgValue } from '../common';
import { DataManager } from '../data/data-manager';

const { ccclass, property } = _decorator;

@ccclass('BattleUseProp')
export class BattleUseProp extends SuperPanel {
    @property({
        type: [Node],
        tooltip: ''
    })
    nodeTitle: Node[] = [];

    @property({
        type: [Node],
        tooltip: ''
    })
    nodeTip: Node[] = [];

    @property({
        type: [Node],
        tooltip: ''
    })
    remindTip: Node[] = [];

    @property({
        type: Label,
        tooltip: ''
    })
    tipProgress: Label = null;


    _idx = null;

    show(idx: number): void {
        this._idx = idx;
        this.nodeTitle.forEach((node) => {
            node.active = false;
        })
        this.nodeTip.forEach((node) => {
            node.active = false;
        })
        this.remindTip.forEach((node) => {
            node.active = false;
        })
        this.nodeTitle[idx].active = true;
        this.nodeTip[idx].active = true;
        this.remindTip[idx].active = true;
    }

    protected onLoad(): void {
        super.onLoad();

        let sum = 0;
        DataManager.dataBattle.hadCollectFull.forEach((count) => {
            sum += count;
        })

        let needSum = 0;
        DataManager.dataBattle.stageConfig.collectFaceId.forEach((count) => {
            needSum += count;
        })
        this.tipProgress.string = Math.floor(sum / needSum * 100) + '%'
    }

    onClickUseProp() {
        uiManager.show(UI_NAME.AdsShowPanel, () => {
            this.lwDispatchEmit(UI_LW_EVENT_NAME.USE_BATTLE_PROP, this._idx);
            this.close();
        });
    }

    start(): void {
        super.start();

    }
}