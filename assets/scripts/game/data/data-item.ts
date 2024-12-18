import { SuperData } from './super-data';
import { DATA_LW_NAME } from '../constant/lw-common-define';


export class LwDataItem extends SuperData {
    public restitutionItem = []; //返回的道具
    // ---------  数据逻辑处理   ------------------
    netMessageHanders = {

    };

    name = DATA_LW_NAME.ITEM_DATA;

    items: { [id: number]: number } = {};
    bagCanSelectNum: number = 0;

    public init(): void {
        super.init();
    }

    // ---------  消息发送和接收end   ------------------
    public clear(): void {
        super.clear();
        this.items = {};
        this.bagCanSelectNum = 0;
    }
}
