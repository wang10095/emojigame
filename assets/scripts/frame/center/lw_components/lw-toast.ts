import { director, instantiate, NodePool, Prefab, _decorator, Node, Animation, Asset, Label, Vec3, Color, isValid, UITransform, v3 } from 'cc';
import { LWManager} from '../lw-manager';
import { uiManager, UI_TYPE_BY_LW } from '../lw_managers/ui-manager';
import { i18n } from '../lw_managers/lw-language-manager';
import { setSecuretNodeString, } from '../../../game/ui-commonset';

export class ToastLw {
    private static toastLwPool: NodePool = new NodePool();
    private static currencyPool: NodePool = new NodePool();

    static async showLwToast(tipStr: string, posY: number = 0, delayTime?: number) {
        let uiToastNode = ToastLw.toastLwPool.get();
        const toastParentNode: Node = uiManager.getLwLayer(UI_TYPE_BY_LW.UI_TOAST_LW);
        if (!uiToastNode) {
            const toastPrefab: Prefab = await LWManager.lwbundleManager.load<Prefab>('common://toast', Prefab);
            if (toastPrefab) {
                uiToastNode = instantiate(toastPrefab);
            } else {
                console.error('loadLWtoastLwerror!');
                return;
            }
        }
        uiToastNode.parent = toastParentNode;
        uiToastNode.setPosition(0, posY);
        uiToastNode.active = false;

        setSecuretNodeString(uiToastNode.getChildByPath('content/lab_content'), i18n.f(tipStr));

        // const anim = uiToastNode.getChildByName('content')!.getComponent(Animation)!;
        // anim.targetOff(this);
        // anim.on(Animation.EventType.FINISHED, () => {
        //     // 动画结束
        //     this.toastLwPool.put(uiToastNode!);
        //     // anim.stop();
        // });
        // if (delayTime && delayTime > 0) {
        //     LWManager.lwtimeManager.unRegisterTimer('toast_show_delay_time');
        //     LWManager.lwtimeManager.registerTimer('toast_show_delay_time', delayTime, delayTime, null, () => {
        //         uiToastNode.active = true;
        //         anim.play();
        //     });
        // } else {
        //     uiToastNode.active = true;
        //     anim.play();
        // }
        ToastLw.showLwToastStep2(uiToastNode,delayTime);
    }

    static showLwToastStep2(uiToastNode:Node,delayTime?: number){
        const animlw = uiToastNode.getChildByName('content')!.getComponent(Animation)!;
        animlw.targetOff(this);
        animlw.on(Animation.EventType.FINISHED, () => {
            // 动画结束
            this.toastLwPool.put(uiToastNode!);
            // anim.stop();
        });
        if (delayTime && delayTime > 0) {
            LWManager.lwtimeManager.unRegisterTimer('toast_lw_show_delay_time');
            LWManager.lwtimeManager.regLwTimer('toast_lw_show_delay_time', delayTime, delayTime, null, () => {
                uiToastNode.active = true;
                animlw.play();
            });
        } else {
            uiToastNode.active = true;
            animlw.play();
        }
    }


}
