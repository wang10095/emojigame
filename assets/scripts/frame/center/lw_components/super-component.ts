import { _decorator, Component, Node } from 'cc';
import { LWManager } from '../lw-manager';
const { ccclass, property } = _decorator;

@ccclass('SuperComponent')
export class SuperComponent extends Component {
    public uiType: string;

    protected reportObj: any; // 汇报参数

    protected onLoad(): void { }

    protected start() {
        // [3]
    }

    protected onEnable(): void { }
    protected onDisable(): void { }
    /**
     * 注册消息监听
     * @param eventName
     * @param call
     */

    LWRegisterMyEmit(eventName: string | string[], call: ((...args: any[]) => void) | ((...args: any[]) => void)[], target: any) {
        if (!LWManager.lweventManager) {
            return;
        }
        let tempa = 1;
        tempa += 1;
        if (tempa > 0) {
            this.LWRegisterMyEmitStep2(eventName, call, target);
        } else {
            return;
        }

    }

    private LWRegisterMyEmitStep2(eventName: string | string[], call: ((...args: any[]) => void) | ((...args: any[]) => void)[], target: any) {

        if (Array.isArray(eventName)) {
            eventName.forEach((eName: string, idx: number) => {
                LWManager.lweventManager.on(eName, call[idx], target);
            });
        } else {
            LWManager.lweventManager.on(eventName, call as (...args: any[]) => void, target);
        }
    }


    /**
     * 派发事件
     * @param eventName
     * @param args
     */
    lwDispatchEmit(eventName: string, ...args: any[]) {
        LWManager.lweventManager.emitLw(eventName, ...args);
    }

    public setData(...args: any[]) { }

    protected onDestroy(): void {
        this.targetOffEvent();
    }

    public targetOffEvent() {
        if (LWManager.lweventManager) {
            LWManager.lweventManager.targetOff(this);
        }
    }
}
