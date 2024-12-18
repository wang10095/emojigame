


import { Node, _decorator } from 'cc';
import ScrollReuseItem from '../../frame/center/lw_components/scroll-item';
import { Sprite } from 'cc';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemCityRank')
export class ItemCityRank extends ScrollReuseItem {
    @property({
        type: Sprite,
    })
    bg: Sprite = null;

    @property({
        type: Label,
        tooltip: "排名"
    })
    labRank: Label = null;

    @property({
        type: Label,
        tooltip: "排名"
    })
    labCityName: Label = null;

    @property({
        type: Label,
        tooltip: "排名"
    })
    labPassNumber: Label = null;

    protected onLoad(): void {
        super.onLoad;
        this.LWRegisterMyEmit([

        ], [

        ], this);

    }


    public renewView(dataIndex: number, data: City) {
        super.renewView(dataIndex, data);

        const randId = data.rankId;
        const cityName = data.name;
        const passCount = data.passNumber;

        this.labRank.string = `第${randId}名`;
        this.labCityName.string = cityName;
        this.labPassNumber.string = passCount + '';

    }


}