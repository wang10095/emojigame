

import { AudioSource, Node, _decorator } from 'cc';
import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { UI_LW_EVENT_NAME } from '../constant/lw-common-define';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { LWManager } from '../../frame/center/lw-manager';

const { ccclass, property } = _decorator;

@ccclass('BattleSuccessPanel')
export class BattleSuccessPanel extends SuperPanel {

    protected onLoad(): void {
        super.onLoad();

        lwUtils.storage.setItem('game_lose_count', '0');
    }

    start(): void {
        super.start();
        LWManager.lwaudioManager.playAudio(this.node.getComponent(AudioSource), 'S_Win');
    }

    close() {
        super.close();
        this.lwDispatchEmit(UI_LW_EVENT_NAME.GAME_NEXT, BATTLE_END_NEXT_OPERATION.NEXTSTAGE);
    }
}