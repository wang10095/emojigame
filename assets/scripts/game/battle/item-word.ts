


import { Node, _decorator, tween, v3 } from 'cc';
import ScrollReuseItem from '../../frame/center/lw_components/scroll-item';
import { DataManager } from '../data/data-manager';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { LWManager } from '../../frame/center/lw-manager';
import { Label } from 'cc';
import { UI_LW_EVENT_NAME } from '../constant/lw-common-define';
const { ccclass, property } = _decorator;

@ccclass('ItemWord')
export class ItemWord extends ScrollReuseItem {
    @property({
        type: Node,
    })
    content: Node = null;
    @property({
        type: Sprite,
    })
    sprite: Sprite = null;
    @property({
        type: Label,
        tooltip: "数量"
    })
    labCount: Label = null;

    protected onLoad(): void {
        super.onLoad;
        this.LWRegisterMyEmit([
            UI_LW_EVENT_NAME.COLLECTION_WORD_UPDATE,
        ], [
            (faceId: number) => {
                if (faceId === this._faceId) { //到了词条栏了 更新数量

                    this.setAnim();
                    const curCount = DataManager.dataSkill.getWordZi(this._faceId);
                    this.labCount.string = '' + curCount;
                }
            }
        ], this);

    }

    _faceId: number = 0;

    public renewView(dataIndex: number, data: Array<number>) {
        super.renewView(dataIndex, data);
        this._faceId = data[0];
        this.setSpriteFrame();

        const curCount = data[1] // DataManager.dataSkill.getWordZi(this._faceId);
        console.log('=================renewView===================', this._faceId, curCount);
        this.labCount.string = '' + curCount;

        if (data[2]) { //新添加
            this.setAnim();
        }
    }

    setAnim() {
        tween(this.content).to(0.3, { scale: v3(1.5, 1.5, 1) }).delay(0.2).to(0.3, { scale: v3(1, 1, 1) }).start();
    }

    async setSpriteFrame() {
        const faceConfig = DataManager.dataBattle.faceConfig[this._faceId];
        const faceName = faceConfig.image;
        const path = `model://image/${faceName}/spriteFrame`;
        const spriteFrame: SpriteFrame = await LWManager.lwbundleManager.load<SpriteFrame>(path, SpriteFrame);
        if (this.node && this.node.isValid && this.sprite && this.sprite.isValid) {
            this.sprite.spriteFrame = spriteFrame;
        }
    }

}