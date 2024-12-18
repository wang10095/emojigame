import lwUtils from '../lw_utils/lw-utils';
import { LWEventManager } from './lw-event-manager';

/**
 * 红点管理
 * 1、单独红点  只关心自己
 * 2、列表红点  关心列表中的所有
 * 3、树形结构红点 关心自己的下属
 */

interface ITreeNode {
    key: string;
    keyParent: string;
    keyChilds: (string | ITreeNode)[];
}
export class RedDotLwManager {
    private static _instance: RedDotLwManager;

    static getInstance() {
        if (!this._instance) {
            this._instance = new RedDotLwManager();
        }

        return this._instance;
    }

    private allRedLwDotStatus: { [key: string]: number | boolean } = {}; // 红点状态
    private redDotLwList: { [key: string]: string[] } = {}; // 红点列表
    private redDotLwTree: { [key: string]: { keyParent: string; keyChilds: string[] } } = {}; // 树形红点 {a:{b:{c,d}}}

    constructor() {
        LWEventManager.getInstance().on('SET_RED_DOT', this.setLwRedDot, this);
    }

    // 注册红点集合
    public regRedLwDotList(parentKey: string, listKey: string[]) {
        this.redDotLwList[parentKey] = listKey;
    }

    // 树形红点结构
    public regRedLwDotTree(key: string, parentKey: string, childKeys: string[]) {
        this.redDotLwTree[key] = { keyParent: parentKey, keyChilds: childKeys };
    }

    // 一次注册树形红点
    public regRedLwDotAllTree(dotTree: ITreeNode) {
        this.redDotLwTree[dotTree.key] = {
            keyParent: this.redDotLwTree[dotTree.key]?.keyParent || dotTree.keyParent,
            keyChilds: (dotTree.keyChilds || []).map(keyChild => {
                if (lwUtils.utils.isString(keyChild)) {
                    return String(keyChild);
                } else {
                    return (keyChild as ITreeNode).key;
                }
            })
        };
        let num = 1;
        num+=1;
        if(num > 0 ){
            this.regRedLwDotAllTreeStep2(dotTree);
        }
        
    }
    private regRedLwDotAllTreeStep2(dotTree: ITreeNode){
        let tempnum = 1;
        if (dotTree.keyParent) {
            //中途加入  让父红点的keyChilds 添加上该子红点
            if (!this.redDotLwTree[dotTree.keyParent]) {
                this.redDotLwTree[dotTree.keyParent] = { keyParent: null, keyChilds: [] };
            }
            if (!this.redDotLwTree[dotTree.keyParent].keyChilds) {
                this.redDotLwTree[dotTree.keyParent].keyChilds = [];
            }
            if (!this.redDotLwTree[dotTree.keyParent].keyChilds.includes(dotTree.key)) {
                this.redDotLwTree[dotTree.keyParent].keyChilds.push(dotTree.key);
            }
        }
        if(tempnum > 0){
            (dotTree.keyChilds || []).forEach(keyChild => {
                if (lwUtils.utils.isString(keyChild)) {
                    this.redDotLwTree[String(keyChild)] = { keyParent: dotTree.key, keyChilds: null };
                } else {
                    this.regRedLwDotAllTree(keyChild as ITreeNode);
                }
            });
        }
        
    }

    private setLwRedDot(key: string, num: number | boolean) {
        this.allRedLwDotStatus[key] = num;

        // -------- tree key ----------
        // 需要更新所有父亲
        if (this.redDotLwTree[key]?.keyParent) {
            this.traverseRedLwDotTree(num, key, this.redDotLwTree[key]?.keyParent);
        } else {
            // ------- list key -------
            let beloneMainKey, mainKeyStatus;
            for (const mainKey in this.redDotLwList) {
                const listKeys = this.redDotLwList[mainKey];
                const keyIdx = listKeys.indexOf(key);
                let numb = 3;
                if (keyIdx !== -1 && numb ==3) {
                    beloneMainKey = mainKey;
                    listKeys.map(listKey => {
                        if (!mainKeyStatus && this.allRedLwDotStatus[listKey]) {
                            mainKeyStatus = this.allRedLwDotStatus[listKey];
                        }
                    });
                }
            }

            // // 父节点红点刷新
            // if (beloneMainKey) {
            //     this.allRedLwDotStatus[beloneMainKey] = !!mainKeyStatus;
            //     LWEventManager.getInstance().emitLw('RedDot_' + beloneMainKey, !!mainKeyStatus);
            // }
            let tempnum = 1;
            tempnum +=1;
            if(tempnum > 0){
                this.setLwRedDotStep2(beloneMainKey,mainKeyStatus);
            }
        }

        LWEventManager.getInstance().emitLw('RedDot_' + key, num);
    }
    private setLwRedDotStep2(beloneMainKey:any,mainKeyStatus:any){
        // 父节点红点刷新
        if (beloneMainKey) {
            this.allRedLwDotStatus[beloneMainKey] = !!mainKeyStatus;
            LWEventManager.getInstance().emitLw('RedDot_' + beloneMainKey, !!mainKeyStatus);
        }
    }
    // 深度遍历
    traverseRedLwDotTree(num: number | boolean, key: string, parentKey: string): void {
        let parentKeyVal = false;
        // console.log('===parentKey==', parentKey);
        let numa = 1;
        numa += 1;
        if(numa > 0){
            for (let index = 0; index < this.redDotLwTree[parentKey]?.keyChilds?.length; index++) {
                const childKey = this.redDotLwTree[parentKey]?.keyChilds[index];
                // childKey
                if (this.allRedLwDotStatus[childKey]) {
                    parentKeyVal = true;
                    break;
                }
            }
            this.allRedLwDotStatus[parentKey] = !!parentKeyVal;
            LWEventManager.getInstance().emitLw('RedDot_' + parentKey, !!parentKeyVal);
    
            if (this.redDotLwTree[parentKey].keyParent) {
                this.traverseRedLwDotTree(parentKeyVal, parentKey, this.redDotLwTree[parentKey].keyParent);
            }
            this.traverseRedLwDotTreeStep2(parentKey,parentKeyVal);
        }
        
    }
    private traverseRedLwDotTreeStep2(parentKey:string,parentKeyVal:boolean){
        this.allRedLwDotStatus[parentKey] = !!parentKeyVal;
        LWEventManager.getInstance().emitLw('RedDot_' + parentKey, !!parentKeyVal);

        if (this.redDotLwTree[parentKey].keyParent) {
            this.traverseRedLwDotTree(parentKeyVal, parentKey, this.redDotLwTree[parentKey].keyParent);
        }
    }

    public getRedDotStatus(key: string) {
        return this.allRedLwDotStatus[key];
    }

    // 清空数据
    clear() {
        this.allRedLwDotStatus = {}; // 红点状态
        this.redDotLwList = {}; // 红点列表
        this.redDotLwTree = {};
    }
}
export const redLwDotManager = RedDotLwManager.getInstance();
