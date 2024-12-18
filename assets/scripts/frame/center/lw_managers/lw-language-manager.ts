import { Font } from 'cc';
import { LWManager } from '../lw-manager';


class LanguageMgr {
    private _curLanguageLw: string = 'zh'; // 当前语言

    private static _i: LanguageMgr;
    globalFont: Font;
    private _isInit = false;
    static getIns() {
        if (!this._i) {
            this._i = new LanguageMgr();
        }

        return this._i;
    }

    constructor() { }

    public init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        console.log('start == LanguageLwManager init ');
        LWManager.lwbundleManager.load('fonts://cuyuan', Font).then(
            (fnt: Font) => {
                console.log('start LanguageManager loaded', fnt);
                this.globalFont = fnt;
                this._isInit = false;
                LWManager.lweventManager.emitLw('font_loaded');
            },
            () => {
                this._isInit = false;
            }
        );
    }


    /**
     * 根据data获取对应语种的字符
     * @param labId
     * @param arr
     */
    private getLanguageByKey(key: string): string {
        return Config.Tips[key]?.[this._curLanguageLw] || Config.L18n[key]?.[this._curLanguageLw] || key;
    }

    /**
     * 翻译数据  包含层级的key
     * @param key
     */
    public f(key: string) {
        if (!this.globalFont) {
            this.init();
        }
        return this.getLanguageByKey(key);
    }
}

export const i18n = LanguageMgr.getIns();
