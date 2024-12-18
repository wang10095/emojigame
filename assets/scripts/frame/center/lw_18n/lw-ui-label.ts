import { _decorator, Component, Label, Node, RichText } from 'cc';
import { i18n } from '../lw_managers/lw-language-manager';
import { SuperComponent } from '../lw_components/super-component';
const { ccclass, property, requireComponent } = _decorator;


@ccclass('LwFontLabel')
export class LwFontLabel extends SuperComponent {
    protected onLoad(): void {
        this.LWRegisterMyEmit('font_loaded', this.updateLwLabFont, this);
        this.updateLwLabFont();
    }

    private getLwLabelCom() {
        let labelCom: Label | RichText = this.node?.getComponent(Label);
        if (!labelCom) {
            labelCom = this.node?.getComponent(RichText);
        }
        return labelCom;
    }

    private updateLwLabFont() {
        const labelCom: Label | RichText = this.getLwLabelCom();
        if (labelCom && labelCom.useSystemFont && i18n.globalFont) {
            // 默认使用系统字体，统一替换为指定字体
            labelCom.useSystemFont = false;
            labelCom.font = i18n.globalFont;
        } else {
            labelCom.useSystemFont = true;
        }
    }
}
