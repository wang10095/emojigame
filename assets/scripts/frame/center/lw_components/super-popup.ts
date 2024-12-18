import { _decorator, Node } from 'cc';
import { UI_TYPE_BY_LW } from '../lw_managers/ui-manager';
import { SuperPanel } from './super-panel';
const { ccclass, property } = _decorator;

@ccclass('SuperPopUp')
export class SuperPopUp extends SuperPanel {
    public uiType: UI_TYPE_BY_LW = UI_TYPE_BY_LW.UI_POPUP_LW;
}
