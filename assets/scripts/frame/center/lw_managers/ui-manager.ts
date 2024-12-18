import { _decorator, Node, Widget, Prefab, instantiate, view, log, path } from 'cc';
import { LWManager} from '../lw-manager';
import lwUtils from '../lw_utils/lw-utils';
import { SuperPanel } from '../lw_components/super-panel';
import { UI_LW_EVENT_NAME } from '../../../game/constant/lw-common-define';
import { SuperLayer } from '../lw_components/super-layer';
// 界面所处层级
export enum UI_TYPE_BY_LW {
    UI_LAYER_LW = 'UI_LAYER_LW',
    UI_PANEL_LW = 'UI_PANEL_LW',
    UI_POPUP_LW = 'UI_POPUP_LW',
    UI_GUIDE_LW = 'UI_GUIDE_LW',
    UI_ALERT_LW = 'UI_ALERT_LW',
    UI_TOAST_LW = 'UI_TOAST_LW'
}

/**
 * 界面弹出管理
 * 根据面板的不同类型设置显示层级
 */
class UILwManager extends lwUtils.Singleton {
    private _uiLwContainer!: Node;
    private _layerLwMap: { [uiType: string]: Node } = {}; // 层级

    private preloadLwPrefabs: Prefab[];
    private _currentShowPanelByLw: { [uiName: string]: { uiNode: Node; uiType: string } | undefined } = {}; // 当前处于打开状态的界面

    public isLoadingPrefabByLw = false; // 正在加载界面
    init(rootContainer: Node, prefabs: Prefab[]) {
        this._uiLwContainer = rootContainer;
        this.preloadLwPrefabs = prefabs;
        // for (const type in UI_TYPE_BY_LW) {
        //     console.info(type);
        //     const layerNode = new Node(type);
        //     var widget: Widget = layerNode.addComponent(Widget);
        //     widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        //     widget.left = widget.right = widget.top = widget.bottom = 0;
        //     widget.enabled = true;
        //     layerNode.parent = this._uiContainer;
        //     this._layerMap[type] = layerNode;
        // }
        this.initStep2();
    }
    private initStep2(){
        let numcc = 1;
        numcc+=1;
        if(numcc > 0){
            for (const type in UI_TYPE_BY_LW) {
                console.info(type);
                const layerNode = new Node(type);
                var widget: Widget = layerNode.addComponent(Widget);
                widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
                widget.left = widget.right = widget.top = widget.bottom = 0;
                widget.enabled = true;
                layerNode.parent = this._uiLwContainer;
                this._layerLwMap[type] = layerNode;
            }
        }
        
    }

    private waitingShowPanel: { uiPath: string; args: any[] }[] = []; //
    async show(uiPath: string, ...args: any[]) {
        try {
            const uiName = this.getUINameLwByPath(uiPath);
            if (this.isLoadingPrefabByLw) {
                this.waitingShowPanel.push({ uiPath, args });
                console.warn('UILwManagerlwlwlwis loading prefab', uiPath, args);
                return;
            }
            this.isLoadingPrefabByLw = true;
            let uiNode: Node | undefined = this._currentShowPanelByLw[uiName]?.uiNode;
            if (!uiNode) {
                // BusyIndicator.show();
                this._currentShowPanelByLw[uiName] = { uiNode: null, uiType: UI_TYPE_BY_LW.UI_PANEL_LW };
                let nodePrefab = this.isPerLoadPrefabByLw(uiName);
                if (!nodePrefab) {
                    nodePrefab = await LWManager.lwbundleManager.load<Prefab>(uiPath, Prefab);
                    if (!nodePrefab) {
                        console.error('loadlwllwprefab error:', uiPath);
                        this._currentShowPanelByLw[uiName] = undefined;
                        delete this._currentShowPanelByLw[uiName];
                        this.isLoadingPrefabByLw = false;
                        return;
                    }
                }
                uiNode = instantiate(nodePrefab);
                let uiClass: SuperPanel | SuperLayer = uiNode.getComponent(SuperPanel);
                if (!uiClass) {
                    uiClass = uiNode.getComponent(SuperLayer);
                }
                if (!this._currentShowPanelByLw[uiName]) {
                    // 被提前关闭或者是clear了
                    return;
                }
                uiNode.parent = this._layerLwMap[uiClass.uiType];
                uiNode.active = true;
                this._currentShowPanelByLw[uiName] = { uiNode: uiNode, uiType: uiClass.uiType };
                this.isLoadingPrefabByLw = false;
                //console.log('show:', uiPath);
                uiClass.show(...args);
                // BusyIndicator.hide();
            } else {
                uiNode.active = true;
                let uiClass: SuperPanel | SuperLayer = uiNode.getComponent(SuperPanel);
                if (!uiClass) {
                    uiClass = uiNode.getComponent(SuperLayer);
                }
                if (!this._currentShowPanelByLw[uiName]) {
                    // 被提前关闭或者是clear了
                    return;
                }
                this._currentShowPanelByLw[uiName] = { uiNode: uiNode, uiType: uiClass.uiType };
                this.isLoadingPrefabByLw = false;
                //console.log('show exsit:', uiPath);
                uiClass.show(...args);
                uiNode.setSiblingIndex(1000); // 最上层
            }
            if (this.waitingShowPanel.length > 0) {
                const { uiPath, args } = this.waitingShowPanel.shift();
                this.show(uiPath, ...args);
            }
            LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_WIN_LW_SHOW, uiName);
        } catch (error) {
            this.isLoadingPrefabByLw = false;
            console.error('UILwManagerlwlwshow error:', uiPath, args, error);
            LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_ERROR_BY_LW, uiPath, error, args);
        }
    }

    close(uiName: string) {
        if (!this._currentShowPanelByLw[uiName]) {
            uiName = this.getUINameLwByPath(uiName);
            if (!this._currentShowPanelByLw[uiName]) {
                //console.warn('UILwManager %s is not open state。', uiName);
                return;
            }
        }
        const uiNode: Node = this._currentShowPanelByLw[uiName]!.uiNode;
        if (uiNode) {
            if (this.isPerLoadPrefabByLw(uiName)) {
                // 提前挂载的界面执行显隐操作
                uiNode.active = false;
                LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_WIN_LW_CLOSE, uiName);
                return;
            }
            uiNode.destroy();
        }
        this._currentShowPanelByLw[uiName] = undefined;
        delete this._currentShowPanelByLw[uiName];

        this.checkShowPopPanel();
        if (uiName != 'item_receive_auto') {
            //所有临时弱提醒都不要发
            LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_WIN_LW_CLOSE, uiName);
        }
    }

    /**
     * 链式弹出面板
     * ignorePanel true 直接弹出不关心是否有其他panel界面展示，false等其它panel关闭后展示
     */
    private popShowPanel: { uiPath: string; args: any; ignorePanel?: boolean }[] = []; //  展示队列，关闭=>弹出
    pop(uiPanels: { uiPath: string; args: any; ignorePanel?: boolean }[]) {
        this.popShowPanel = this.popShowPanel.concat(uiPanels);
        this.checkShowPopPanel();
    }

    // 检测是否有缓存的弹出队列
    private checkShowPopPanel() {
        if (this.popShowPanel.length > 0) {
            const willShowPanel = this.popShowPanel[0];
            const hasShowPanel = this.checkHasShowUIType([UI_TYPE_BY_LW.UI_PANEL_LW, UI_TYPE_BY_LW.UI_POPUP_LW, UI_TYPE_BY_LW.UI_GUIDE_LW, UI_TYPE_BY_LW.UI_ALERT_LW]);
            if (willShowPanel.ignorePanel || (!willShowPanel.ignorePanel && !hasShowPanel)) {
                const { uiPath, args } = this.popShowPanel.shift();
                if (!args) {
                    this.show(uiPath);
                } else if (lwUtils.utils.isObject(args)) {
                    this.show(uiPath, args);
                } else {
                    this.show(uiPath, ...args);
                }
            }
        }
    }

    isShow(uiPath: string) {
        const uiName = this.getUINameLwByPath(uiPath);
        return !!(this._currentShowPanelByLw[uiName] && this._currentShowPanelByLw[uiName].uiNode?.active);
    }

    getPanelLwNode(uiPath: string) {
        const uiName = this.getUINameLwByPath(uiPath);
        return this._currentShowPanelByLw[uiName]?.uiNode;
    }

    getLwLayer(uiType: UI_TYPE_BY_LW) {
        return this._layerLwMap[uiType];
    }

    // 提前load的界面 在show和close的时候执行显隐操作 非回收创建，一般用于极度复用的弹出
    private isPerLoadPrefabByLw(prefabName: string): Prefab {
        for (const prefab of this.preloadLwPrefabs) {
            if (prefab && prefab.name === prefabName) {
                return prefab;
            }
        }

        return null;
    }

    /**
     *  是否有再展示的面板
     */
    checkHasShowUIType(types: UI_TYPE_BY_LW[], excludePanels?: string[]) {
        for (const uiName in this._currentShowPanelByLw) {
            const uiInfo = this._currentShowPanelByLw[uiName];
            if (excludePanels && excludePanels.indexOf(uiName) > -1) {
                continue;
            }
            if (types.indexOf(uiInfo.uiType as UI_TYPE_BY_LW) !== -1 && uiInfo.uiNode?.active) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param uiPath 预制完整路径
     *
     */
    getUINameLwByPath(uiPath: string): string {
        if (!uiPath) {
            return;
        }
        return path.basename(uiPath);
    }

    clear(type?: UI_TYPE_BY_LW, excludePanels?: string[]) {
        for (const uiName in this._currentShowPanelByLw) {
            const uiInfo = this._currentShowPanelByLw[uiName];
            if (!type || uiInfo.uiType === type) {
                if (excludePanels && excludePanels.indexOf(uiName) > -1) {
                    continue;
                }
                this.close(uiName);
                if (this.isPerLoadPrefabByLw(uiName)) {
                    this._currentShowPanelByLw[uiName] = undefined;
                    delete this._currentShowPanelByLw[uiName];
                }
            }
        }
        this.isLoadingPrefabByLw = false;
        this.popShowPanel = [];
    }
}

export const uiManager = UILwManager.getInstance();
