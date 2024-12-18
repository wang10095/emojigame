import { Node, _decorator, tween, v3, view } from 'cc';
import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { UI_LW_EVENT_NAME } from '../constant/lw-common-define';
import { BATTLE_END_NEXT_OPERATION } from '../data/data-battle';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { SuperLayer } from '../../frame/center/lw_components/super-layer';

const { ccclass, property } = _decorator;

@ccclass('GuildPanel')
export class GuildPanel extends SuperLayer {

    @property({
        type: Node
    })
    nodeHand: Node = null;

    protected onLoad(): void {
        super.onLoad();

    }

    start(): void {
        const size = view.getVisibleSize();

        const height = this.nodeHand.getPosition().y;

        tween(this.nodeHand)
            .to(0.5, { position: v3(-size.width / 2 + 100, height, 0) })
            .to(1.0, { position: v3(size.width / 2 - 100, height, 0) })
            .to(0.5, { position: v3(0, height, 0) })
            .union()
            .repeatForever()
            .start();
    }

    onClickBackHome() {

    }

}