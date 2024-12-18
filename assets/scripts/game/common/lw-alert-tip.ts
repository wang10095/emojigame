import { _decorator, Node } from 'cc';
// import { SuperPanel } from '../../frame/center/lw_components/super-panel';
// import { Label } from 'cc';
// import { RichText } from 'cc';

// const { ccclass, property } = _decorator;


// 对话框参数声明
// export interface LWIDialogData {
//     confirm?: Function; // 确定回调
//     desc?: string; // 文本内容信息
//     remark?: string; // 备注提示信息
//     needCheck?: boolean; // 是否需要检查提示
// }


// @ccclass('AlertTip')
// export class AlertTip extends SuperPanel {
//     @property({
//         type: Node,
//         displayName: '描述'
//     })
//     labDescNode: Node;

//     @property({
//         type: Node,
//         displayName: '备注'
//     })
//     labRemarkNode: Node;

//     @property({
//         type: Node,
//         displayName: '是否不在提示节点'
//     })
//     nodeCheck: Node;

//     private __mData: LWIDialogData = null;

//     start() {
//         super.start()
//     }

//     show(data: LWIDialogData) {
//         this.__mData = data;
//         this.labDescNode.getComponent(RichText).string = data.desc || '';
//         this.labRemarkNode.getComponent(Label).string = data.remark || '';
//         this.showStep2(data);
//     }
//     protected showStep2(data: LWIDialogData){
//         if (!data.remark) {
//             this.labRemarkNode.active = false;
//         }
//         if (data.needCheck) {
//             this.nodeCheck.active = true;
//         }
//     }

//     onBtnClickConfirm() {
//         if (this.__mData?.confirm) {
//             this.__mData.confirm?.();
//         }
//         this.close();
//     }
// } 