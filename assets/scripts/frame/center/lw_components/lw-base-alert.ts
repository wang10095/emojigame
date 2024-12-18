import { _decorator, Component, Event, Label, Node, RichText } from 'cc';
import { SuperPanel } from './super-panel';
import { UI_TYPE_BY_LW } from '../lw_managers/ui-manager';
import { i18n } from '../lw_managers/lw-language-manager';

const { ccclass, property } = _decorator;

export interface LWIDialogInfo {
    tipStr: string; // 提示内容
    title?: string; // 标题
    confirmStr: string; // 确定按钮描述
    cancelStr?: string; // 取消按钮描述
    close?: boolean; //关闭按钮
}

// 对话框参数声明
export interface LWIDialogData {
    dlgInfo: LWIDialogInfo; // 对话框信息
    confirm?: Function; // 确定回调
    cancel?: Function; // 取消回调
    remindInfo?: number[]; // 提醒信息：本日登录提示等
    close?: Function;//关闭按钮
}

@ccclass('LWBaseAlert')
export class LWBaseAlert extends SuperPanel {
    public uiType: UI_TYPE_BY_LW = UI_TYPE_BY_LW.UI_ALERT_LW;
    @property({
        type: Node,
        // tooltip: '标题'
    })
    private titleLWNode: Node;

    @property({
        type: Node,
        // tooltip: '描述'
    })
    private descLwNode: Node;

    @property({
        type: Node,
        //tooltip: '确认按钮'
    })
    private btnLwOk: Node;

    @property({
        type: Node,
        // tooltip: '取消按钮'
    })
    private btnLwCancel: Node;

    @property({
        type: Node,
        //tooltip: '关闭按钮'
    })
    private btnLwClose: Node;

    @property({
        type: Node,
        //tooltip: '提醒节点'
    })
    protected remindLwNode: Node;

    private curDlgLwData: LWIDialogData;
    start() {
        super.start();
    }

    show(dlgData: LWIDialogData) {
        super.show(dlgData);
        this.curDlgLwData = dlgData;

        const { tipStr, title, confirmStr, cancelStr, close } = dlgData.dlgInfo;

        //this.titleLWNode.getChildByName('lab_title').getComponent(Label).string = i18n.f(title) || i18n.f('common_alert_title');

        if(i18n.f(title)){
            this.titleLWNode.getChildByName('lab_Lw_title').getComponent(Label).string = i18n.f(title);
        }else{
            this.titleLWNode.getChildByName('lab_Lw_title').getComponent(Label).string = i18n.f('common_alert_title');
        }

        // if(this.descLwNode ){
        //     if (this.descLwNode.getComponent(Label)) {
        //         this.descLwNode.getComponent(Label).string = i18n.f(tipStr) || tipStr || '';
        //     } else if (this.descLwNode.getComponent(RichText)) {
        //         this.descLwNode.getComponent(RichText).string = i18n.f(tipStr) || tipStr || '';
        //     }
        // }
        if(this.descLwNode && this.descLwNode.getComponent(Label)){
            this.descLwNode.getComponent(Label).string = i18n.f(tipStr) || tipStr || '';
        }
        if(this.descLwNode && this.descLwNode.getComponent(RichText)){
            this.descLwNode.getComponent(RichText).string = i18n.f(tipStr) || tipStr || '';
        }

        if(this.btnLwOk){
            this.btnLwOk.active = confirmStr !== undefined;
        }

        
        if (confirmStr) {
            this.btnLwOk.getChildByName('name').getComponent(Label).string = i18n.f(confirmStr);
        }
        this.btnLwCancel.active = cancelStr !== undefined;
        if (cancelStr) {
            this.btnLwCancel.getChildByName('name').getComponent(Label).string = i18n.f(cancelStr);
        }
        if (this.btnLwClose) {
            this.btnLwClose.active = close !== undefined;
        }

        // if (this.remindLwNode) {
        //     if (data.remindInfo) {
        //         this.remindLwNode.active = true;
        //         this.remindLwNode.getComponent(StorageRemindButton).setData(data.remindInfo);
        //     } else {
        //         this.remindLwNode.active = false;
        //     }
        // }
    }

    private lwConfirmBtnClick(event: Event) {
        this.curDlgLwData?.confirm && this.curDlgLwData?.confirm();
        this.close();
    }

    private lwCancelBtnClick(event: Event) {
        this.curDlgLwData?.cancel && this.curDlgLwData.cancel();

        this.close();
    }

    close() {
        super.close();
        this.curDlgLwData?.close && this.curDlgLwData.close();
    }
}
