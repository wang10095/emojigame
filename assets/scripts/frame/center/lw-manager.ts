import { _decorator, Node } from 'cc';
import { LWTimerManager } from './lw_managers/lw-timer-manager';
import { LWEventManager } from './lw_managers/lw-event-manager';
import { LWBundleManager } from './lw_managers/lw-bundle-manager';
import { LWAudioManager } from './lw_managers/lw-audio-manager';
import { LWFileManager } from './lw_managers/lw-file-manager';
import { i18n } from './lw_managers/lw-language-manager';
// import { LWRemoteImageManager } from './lw_managers/lw-remote-image-manager';

const { ccclass, property } = _decorator;

export class LWManager {
    static hasInit = false;
    /** 资源管理管理 */
    public static lwbundleManager: LWBundleManager;
    /** 时间管理 */
    public static lwtimeManager: LWTimerManager;
    /** 音效管理 */
    public static lwaudioManager: LWAudioManager;
    /** 事件管理 */
    public static lweventManager: LWEventManager;
    /** 文件管理 */
    public static lwfileManager: LWFileManager;
    /** 远程图片管理 */
    // public static lwremoteImageManager: LWRemoteImageManager;

    public static init(rootNode: Node) {
        LWManager.hasInit = true;
        this.lwbundleManager = LWBundleManager.getInstance();
        this.lwtimeManager = LWTimerManager.getInstance();
        this.lwaudioManager = LWAudioManager.getInstance(rootNode);
        this.lwaudioManager.init();
        this.lweventManager = LWEventManager.getInstance();

        //文件管理
        this.lwfileManager = LWFileManager.getInstance();
        // this.lwremoteImageManager = LWRemoteImageManager.getInstance();

        i18n.init();
    }
}