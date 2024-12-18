import { _decorator, Animation, director, Node, Skeleton, sp } from 'cc';
import { DataManager } from '../data/data-manager';
import { SuperComponent } from '../../frame/center/lw_components/super-component';
import { SuperSpine } from '../../frame/center/lw_components/super-spine';
import { UI_LW_EVENT_NAME } from '../constant/lw-common-define';
import { uiManager } from '../../frame/center/lw_managers/ui-manager';
import { LWManager } from '../../frame/center/lw-manager';
import { getRandomInt } from '../common';
const { ccclass, property } = _decorator;


@ccclass('LWChangeScene')
export class LWChangeScene extends SuperComponent {
    @property({
        type: Node,
    })
    content: Node;

    @property({
        type: SuperSpine,
    })
    spine: SuperSpine = null;

    @property({
        type: [sp.SkeletonData],
        tooltip: '菜单对应内容'
    })
    spineData: sp.SkeletonData[] = [];

    protected onLoad(): void {
        director.addPersistRootNode(this.node);
        this.content.active = false;
        this.LWRegisterMyEmit(
            UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE_PRE,
            (sceneName, showAnim, opt?: Array<string>) => {

                if (showAnim) {
                    this.changeSceneAnim(sceneName, opt);
                } else {
                    this.changeScene(sceneName, opt);
                }
            },
            this
        );

    }

    private changeSceneAnim(sceneName: string, opt: Array<string> = []) {
        this.content.active = true;

        this.spine.getComponent(sp.Skeleton).skeletonData = this.spineData[getRandomInt(0, this.spineData.length - 1)];
        this.spine.getComponent(SuperSpine).playLwSpine("start", false, async () => {
            const homeBundle = await LWManager.lwbundleManager.loadLwBundle(sceneName);

            const task = opt;
            const allPromise = [];
            task.forEach((bundleName) => {
                allPromise.push(LWManager.lwbundleManager.loadLwBundle(bundleName));
            })
            await Promise.all(allPromise);

            homeBundle.loadScene(sceneName, async () => {
                director.loadScene(sceneName)
                this.spine.getComponent(SuperSpine).playLwSpine('end', false, () => {
                    this.content.active = false;
                    LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE, sceneName);
                });

            });
        });
    }

    private async changeScene(sceneName: string, opt: Array<string> = []) {
        uiManager.clear();
        const homeBundle = await LWManager.lwbundleManager.loadLwBundle(sceneName);

        const task = opt;
        const allPromise = [];
        task.forEach((bundleName) => {
            allPromise.push(LWManager.lwbundleManager.loadLwBundle(bundleName));
        })
        await Promise.all(allPromise);

        homeBundle.loadScene(sceneName, async () => {
            director.loadScene(sceneName, () => {
                LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE, sceneName);
            });
        });
    }

    protected onDestroy(): void {
        super.onDestroy();
    }
}
