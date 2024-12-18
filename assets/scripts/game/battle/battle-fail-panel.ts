

import { AudioSource, Node, _decorator } from 'cc';
import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { UI_LW_EVENT_NAME, UI_NAME } from '../constant/lw-common-define';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { uiManager } from '../../frame/center/lw_managers/ui-manager';
import { LWManager } from '../../frame/center/lw-manager';

const { ccclass, property } = _decorator;

@ccclass('BattleFailPanel')
export class BattleFailPanel extends SuperPanel {

    protected onLoad(): void {
        super.onLoad();

        let count = lwUtils.storage.getItem('game_lose_count');
        if (count) {
            count = Number(count) + 1;
            lwUtils.storage.setItem('game_lose_count', count);
        } else {
            lwUtils.storage.setItem('game_lose_count', "1");
        }
    }

    start(): void {
        super.start();
        LWManager.lwaudioManager.playAudio(this.node.getComponent(AudioSource), 'S_Fail'); 
    }

    close() {
        super.close();
        this.lwDispatchEmit(UI_LW_EVENT_NAME.GAME_NEXT, BATTLE_END_NEXT_OPERATION.BACKHOME);
    }
}