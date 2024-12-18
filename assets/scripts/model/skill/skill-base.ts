
import { Node, _decorator, Animation } from 'cc';

import { SuperComponent } from '../../frame/center/lw_components/super-component';
import { Vec2 } from 'cc';
import { DataManager } from '../../game/data/data-manager';
import { SkillStatus } from '../../game/data/data-skill';
import { SuperAnimation } from '../../frame/center/lw_components/super-animal';

const { ccclass, property } = _decorator;


export interface SkillSet {
    skillName: string;
    createPos: Vec2;
    setCreatePos(pos: Vec2); //设置技能坐标

}

@ccclass("SkillBase")
export abstract class SkillBase extends SuperComponent {
    @property({
        type: [Animation],
        tooltip: '动画队列'
    })
    nodeAnim: Animation[] = [];

    _curAnimCount: number = 0;
    protected onLoad(): void {
        super.onLoad();

        this._curAnimCount = 0;

        this.LWRegisterMyEmit([
            'event_animation_end',
        ], [
            () => {
                if (this._curAnimCount >= this.nodeAnim.length - 1) {
                    this.node.destroy();
                    DataManager.dataSkill.setStatus(SkillStatus.None);
                    DataManager.dataSkill.nextSkillTrigger();
                } else {
                    this._curAnimCount++;
                    this.nodeAnim[this._curAnimCount].getComponent(SuperAnimation).play();
                }
            },
        ], this);
    }

    protected start(): void {
        super.start();
    }
}


export class SkillAction {
    action() {

    }
}

export class SkillBoom1 extends SkillAction {
    action(): void {
        console.log('boom1');

    }
}

export class SkillBoom2 extends SkillAction {
    action(): void {
        console.log('boom2');
    }

}

export class SkillBoom3 extends SkillAction {
    action(): void {
        console.log('boom3');
    }

}