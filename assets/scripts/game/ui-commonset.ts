import {
    Node,
    Label,
    RichText,
    Vec3,
    UITransform,
    v3,
    Prefab,
    tween,
    instantiate,
    Sprite,
    SpriteFrame,
    path,
    isValid
} from 'cc';
import { UI_LW_EVENT_NAME } from './constant/lw-common-define';
import { LWManager } from '../frame/center/lw-manager';
import { bezier } from 'cc';
import { FacePerticleType } from './battle/collect-face';

export type IconType = 'equip' | 'chest';

// 加载资源spriteframe
export function loadingSpriteFrame(filePath: string): Promise<SpriteFrame> {
    filePath = path.join(filePath, 'spriteFrame');
    return LWManager.lwbundleManager.load(filePath, SpriteFrame);
}

// export async function asyncLoadingSpriteFrame(filePath: string): Promise<SpriteFrame> {
//     return new Promise((resolve, reject) => {
//         loadingSpriteFrame(filePath).then(spriteFrame => {
//             resolve(spriteFrame);
//         });
//     });
// }

// 设置资源 使用改方法设置的资源需要回收
export function setSecureSpriteFrame(target: Node | Sprite, filePath: string, complete?: (filePath?: string) => void, isSkin = false): void {
    if (filePath.startsWith('res/')) {
        // safeSetRemoteSpriteFrame(target, filePath, complete);
        return;
    }
    loadingSpriteFrame(filePath)
        .then(spriteFrame => {
            if (!target || !isValid(target)) {
                return;
            }
            let sprite: Sprite;
            if (target instanceof Node) {
                sprite = (target as Node).getComponent(Sprite);
            } else if (target instanceof Sprite) {
                sprite = target;
            }

            // 必须是不同的资源才更新
            if (sprite.spriteFrame && sprite.spriteFrame.uuid != spriteFrame.uuid) {
                sprite.spriteFrame = spriteFrame;
                complete && complete(filePath);
            } else {
                sprite.spriteFrame = spriteFrame;
                complete && complete(filePath);
            }
            console.log('target:', filePath, spriteFrame);
        })
        .catch(err => {
            if (err) {
                console.error('safeSetSpriteFrame Error:', err);
            }
            complete && complete(filePath);
        });

}

// 加密的资源图，需要销毁后重新设置，否则web不生效
// export function destroyIcon(spr: Sprite) {
//     if (isBrowser && spr.spriteFrame) {
//         spr.spriteFrame = null;
//     }
// }

/**
 * @zh 加载远程资源
 * @param filePath 加载资源路径
 * @param target 资源关联的节点，当检查到资源关联的所有结点都被销毁时，资源会被销毁，如果不传入节点，则需要自己通过引用计数管理资源，切记，decRef要传false
 **/
// export function loadRemoteSpriteFrame(filePath: string, target: Node | Sprite): Promise<Texture2D> {
//     return ResManager.getInstance().loadRemote(filePath, target);
// }
// // 远程资源加载展示
// export async function safeSetRemoteSpriteFrame(target: Node | Sprite, filePath: string, complete?: (filePath?: string) => void) {
//     loadRemoteSpriteFrame(filePath, target).then(
//         (spriteTexture: Texture2D) => {
//             if (spriteTexture) {
//                 if (!target || !isValid(target)) {
//                     return;
//                 }
//                 let sprite: Sprite;
//                 if (target instanceof Node) {
//                     sprite = (target as Node).getComponent(Sprite);
//                 } else if (target instanceof Sprite) {
//                     sprite = target;
//                 }
//                 const spriteFrame = new SpriteFrame();
//                 spriteFrame.texture = spriteTexture;
//                 // 必须是不同的资源才更新
//                 if (sprite.spriteFrame && sprite.spriteFrame.uuid != spriteFrame.uuid) {
//                     sprite.spriteFrame = spriteFrame;
//                     complete && complete(filePath);
//                 } else {
//                     sprite.spriteFrame = spriteFrame;
//                     complete && complete(filePath);
//                 }
//             }
//         },
//         (err: string) => {
//             console.error('load Remote url :', filePath, err);
//         }
//     );
// }

// // 异步加载远程资源
// export async function asyncLoadRemoteSpriteFrame(target: Node | Sprite, filePath: string): Promise<SpriteFrame> {
//     return new Promise((resolve, reject) => {
//         loadRemoteSpriteFrame(filePath, target).then(
//             (spriteTexture: Texture2D) => {
//                 if (spriteTexture) {
//                     if (!target || !isValid(target)) {
//                         return;
//                     }
//                     const spriteFrame = new SpriteFrame();
//                     spriteFrame.texture = spriteTexture;
//                     resolve(spriteFrame);
//                 }
//             },
//             (err: string) => {
//                 console.error('load Remote url :', filePath, err);
//                 reject(err);
//             }
//         );
//     });
// }

/**
 * 加载远程plist
 * @param target 依附的目标对象
 * @param atlasUrl  地址
 * @param cache 是否需要缓存起来，默认false。 正常情况下无需缓存，仅仅用于target为父对象，在子类中不容易获取的时候缓存起来，容易读取，随类的destory清空
 * @returns
 */
// export async function loadRemoteAtlas(target: Node | Sprite, atlasUrl: string, cache = false) {
//     return await ResManager.getInstance().loadRemoteAtlas(target, atlasUrl, cache);
// }

// export const getFullScreenScale = (nodeWith?: number, nodeHeight?: number, fix?: 'height' | 'width') => {
//     const wScale = view.getVisibleSize().width / (nodeWith || 1624);
//     const hScale = view.getVisibleSize().height / (nodeHeight || 750);
//     if (!fix) {
//         return Math.max(wScale, hScale);
//     }
//     return fix === 'height' ? hScale : wScale;
// };

// export const setFullScreenScale = (node: Node, fix?: 'height' | 'width') => {
//     const fullScale = getFullScreenScale(node.getComponent(UITransform).width, node.getComponent(UITransform).height, fix);
//     node.setScale(v3(fullScale, fullScale, 0));
// };

// // 设置文本内容
export function setSecuretNodeString(labelNode: Node, txt: string) {
    let lab: any = labelNode.getComponent(Label);
    if (!lab) {
        lab = labelNode.getComponent(RichText);
    }
    if (lab) {
        lab.string = txt;
    }
}

// 游戏通用字色-所有稀有度相关
// 设置文本品质颜色

// function setLabelColor(labNode: Node | Label, noteColor: string, frameColor: string, txt?: string) {
//     const labTxt: Label = (labNode as Node).getComponent(Label) || (labNode as Label);
//     if (labTxt.enableOutline) {
//         const fColor = new Color();
//         fColor.fromHEX(frameColor);
//         labTxt.outlineColor = fColor;
//         if (labTxt) {
//             const nColor = new Color();
//             nColor.fromHEX(noteColor);
//             labTxt.color = nColor;
//             if (txt) {
//                 labTxt.string = `${txt}`;
//             }
//         }
//     } else if (labTxt) {
//         const nColor = new Color();
//         nColor.fromHEX(frameColor);
//         labTxt.color = nColor;
//         if (txt) {
//             labTxt.string = `${txt}`;
//         }
//     }
// }

/**
 * @description 将指定的节点转化为世界坐标系
 * @param node
 * */
export function convertToWorldSpaceLWAR(node: Node): Vec3 {
    return node.parent.getComponent(UITransform).convertToWorldSpaceAR(node.position);
}

/**
 * @description 将世界节点转化为节点坐标系
 * @param node
 * */
export function convertToNodeSpaceLWAR(worldPos: Vec3, node: Node): Vec3 {
    return node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
}

//更改父节点并且位置不变
export function changeParent(node: Node, parentNode: Node) {
    const wordPos = convertToWorldSpaceLWAR(node);
    const pos = convertToNodeSpaceLWAR(wordPos, parentNode);
    node.parent = parentNode;
    node.setPosition(pos);
}

/**
 * @description  点击在组件范围
 * @param checkNode 是否在该节点
 * @param point 点击位置
 *
 * getBoundingBoxToWorld 这个方法在某些时候有问题
 * */
// export function pointInNodeRect(checkNode: Node, point: Vec2) {
//     const worldPos = convertToWorldSpaceAR(checkNode);
//     const trans = checkNode.getComponent(UITransform);
//     const worldRect = rect(worldPos.x - trans.width * trans.anchorX, worldPos.y - trans.height * trans.anchorY, trans.width, trans.height);
//     return worldRect.contains(point);
// }

/**
 * @description  限定在视图范围内 ， 防止超出边界
 * @param content 节点
 * @param worldPos 世界坐标
 * */
// export function contentLimitInView(content: Node, worldPos?: Vec3, anchorPoint?: Vec2) {
//     const contentPos = content.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPos || v3(0, 0, 0));
//     anchorPoint = anchorPoint || v2(0.5, 0.5);
//     const contentSize = content.getComponent(UITransform).contentSize;
//     const contentWidth = contentSize.width;
//     const contentHeight = contentSize.height;
//     const tempPos = v3(contentPos.x, contentPos.y, 0);
//     const halfViewWidth = view.getVisibleSize().width * 0.5;
//     const halfViewHeight = view.getVisibleSize().height * 0.5;
//     // 溢出边界
//     if (tempPos.x + (1 - anchorPoint.x) * contentWidth > halfViewWidth) {
//         tempPos.x = halfViewWidth - (1 - anchorPoint.x) * contentWidth;
//     }
//     if (tempPos.x - anchorPoint.x * contentWidth < -halfViewWidth) {
//         tempPos.x = -halfViewWidth + anchorPoint.x * contentWidth;
//     }
//     if (tempPos.y + (1 - anchorPoint.y) * contentHeight > halfViewHeight) {
//         tempPos.y = halfViewHeight - (1 - anchorPoint.y) * contentHeight;
//     }
//     if (tempPos.y - anchorPoint.y * contentHeight < -halfViewHeight) {
//         tempPos.y = -halfViewHeight + anchorPoint.y * contentHeight;
//     }

//     content.position = tempPos;
// }

/**
 * 手动布局,保持最后一行的内容居中展示
 * @param content 父容器
 * @param itemNode 条目
 * @param colNum 每行列数
 */
// export function autoLayoutNoLayout(content: Node, colNum?: number) {
//     if (content.children.length <= 0) {
//         return;
//     }
//     const contentWidth = content.getComponent(UITransform).width;
//     const itemWidth = content.children[0].getComponent(UITransform).width;
//     const itemHeight = content.children[0].getComponent(UITransform).height;
//     let totalHeigth = 1;
//     if (!colNum) {
//         colNum = Math.floor(contentWidth / itemWidth);
//     }
//     let gap = 0;
//     if (colNum < 1) {
//         colNum = 1;
//     }
//     if (colNum > 1) {
//         gap = (contentWidth - itemWidth * colNum) / (colNum - 1);
//     }
//     const contentAnchorX = content.getComponent(UITransform).anchorX;

//     let totalItemNum = 0;
//     content.children.forEach(child => {
//         if (child.active) {
//             totalItemNum++;
//         }
//     });

//     const rowNum = Math.ceil(totalItemNum / colNum);
//     const lastRowItemNum = totalItemNum % colNum;
//     let idx = 0;
//     for (let i = 0; i < content.children.length; i++) {
//         const item = content.children[i];
//         if (item.active) {
//             const rowIdx = Math.floor(idx / colNum);
//             const colIdx = idx % colNum;
//             let itemOffsetX = itemWidth * (idx % colNum) + gap * rowIdx;
//             let offsetMaxWidth = contentWidth;
//             if (rowIdx + 1 === rowNum && lastRowItemNum !== 0) {
//                 // 最后一行
//                 offsetMaxWidth = itemWidth * lastRowItemNum + gap * (lastRowItemNum - 1);
//             }
//             if (contentAnchorX === 0.5) {
//                 itemOffsetX = itemOffsetX - offsetMaxWidth / 2;
//             } else if (contentAnchorX === 1) {
//                 itemOffsetX = itemOffsetX - offsetMaxWidth;
//             }
//             itemOffsetX += itemWidth * 0.5;
//             item.setPosition(itemOffsetX, -itemHeight * rowIdx);
//             idx++;
//         }
//     }

//     return totalHeigth * idx;
// }
// 跳转到对应场景
export async function gotoLWScene(sceneName: string, anim: boolean = false, opt?: any) {
    LWManager.lweventManager.emitLw(UI_LW_EVENT_NAME.GAME_SWITCH_LW_SCENE_PRE, sceneName, anim, opt);
}

// // 缓动动画
// export async function tweenAnim(target: Node, delay: number, dur: number, props: any) {
//     return new Promise((resolve, reject) => {
//         tween(target)
//             .delay(delay)
//             .to(dur, props)
//             .call(() => {
//                 resolve('');
//             })
//             .start();
//     });
// }

/**
 *  二阶贝塞尔曲线 运动
 * @param target
 * @param {number} duration
 * @param {} c1 起点坐标 v3(x,y,scale)
 * @param {} c2 控制点 v3(x,y,scale)
 * @param {Vec3} to 终点坐标 v3(x,y,scale)
 * @param opts
 * @returns {any}
 */
export function bezierCurveTo(target: Node, duration: number, delay: number, c1: Vec3, c2: Vec3, to: Vec3, opts: any, callFunc?: () => void) {
    opts = opts || Object.create(null);
    /**
     * @desc 二阶贝塞尔
     * @param {number} t 当前百分比
     * @param {} p1 起点坐标
     * @param {} cp 控制点
     * @param {} p2 终点坐标
     * @returns {any}
     */
    const twoBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
        const x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;

        const scale = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
        return v3(x, y, scale);
    };
    opts.onUpdate = (arg: Vec3, ratio: number) => {
        const bezierResult = twoBezier(ratio, c1, c2, to);
        target.position = v3(bezierResult.x, bezierResult.y, 0);
        target.angle = (bezierResult.z, bezierResult.z, bezierResult.z);
    };
    return tween(target)
        .delay(delay)
        .to(duration, {}, opts)
        .call(() => {
            callFunc && callFunc();
        })
        .start();
}

export function bezierCurveTo2(changeAngle: boolean = false, target: Node, playTime: number, delay: number, startPos: Vec3, midPos: Vec3, endPos: Vec3, opt: any, callBack?: () => void) {
    var fruit = target;
    const angle = target.angle; //2d 游戏下angle不能变

    var fruitTween = tween(startPos);
    const mixY = midPos.y;
    const maxY = endPos.y;
    const mixX = midPos.x;
    const maxX = endPos.x;

    var progressX = function (start, end, current, t) {
        current = bezier(start, mixX, maxX, end, t);
        return current;
    };
    var progressY = function (start, end, current, t) {
        current = bezier(start, mixY, maxY, end, t);
        return current;
    };
    const tempVec3 = v3(startPos.x, startPos.y, startPos.z);
    fruitTween.delay(delay).parallel(
        tween()
            .to(playTime, { x: endPos.x }, {
                progress: progressX, easing: opt.easing, onUpdate: (target, ratio) => {
                    fruit.setPosition(startPos);

                    if (changeAngle) {
                        //计算出朝向
                        let deltaX = startPos.x - tempVec3.x;
                        let deltaY = startPos.y - tempVec3.y;
                        let angle2 = Math.atan2(-deltaY, -deltaX);

                        tempVec3.x = startPos.x;
                        tempVec3.y = startPos.y;
                        tempVec3.z = startPos.z;
                        var degree = angle2 * 180 / Math.PI;
                        fruit.angle = degree + 90;
                    } else {
                        fruit.angle = angle;
                    }
                }
            }),
        tween().to(playTime, { y: endPos.y }, {
            progress: progressY, easing: opt.easing, onUpdate: (target, ratio) => {
                fruit.setPosition(startPos);
            },
        }),
    ).call(() => {
        if (callBack) {
            callBack();
            callBack = null;
        }
    }).start();
}


// 缓动动画
// export async function tweenBezierTo(target: Node, duration: number, delay: number, c1: Vec3, c2: Vec3, to: Vec3, opts: any) {
//     return new Promise((resolve, reject) => {
//         bezierTo(target, duration, delay, c1, c2, to, opts, () => {
//             resolve('callFunc');
//         });
//     });
// }

// //收集金币效果
// export async function collectGoldAnimal(goldTarget, delayDur: number, targetPos: Vec3, call?: () => void) {
//     Tween.stopAllByTarget(goldTarget);
//     tween(goldTarget)
//         .delay(delayDur)
//         .to(0.6, { position: targetPos, scale: v3(0.8, 0.8, 0.8) }, { easing: 'sineIn' })
//         .call(() => {
//             call && call();
//         })
//         .start();
// }

// 闪烁
// export async function flicker(binkNode: Node, count: number = 2, call?: () => void) {
//     Tween.stopAllByTarget(binkNode);
//     const blinkAct = tween(binkNode)
//         // 放大到 1.1 倍
//         .to(0.2, { scale: v3(1.4, 1.4, 1) })
//         // 缩小回 1 倍
//         .to(0.2, { scale: v3(1.2, 1.2, 1) })
//         // 不断重复
//         .union();
//     if (count == -1) {
//         blinkAct.repeatForever().start();
//     } else {
//         blinkAct
//             .repeat(count)
//             .call(() => {
//                 call && call();
//             })
//             .start();
//     }
// }

/**
 * 飞向目标位置
 * @param flyNode 节点
 * @param delayDur 延迟时间
 * @param flyDur 飞行时间
 * @param targetPos 目标位置
 * @param call 回调
 */
// export async function flyToTarget(flyNode, delayDur: number, flyDur: number, targetPos: Vec3, endScale = v3(1, 1, 1)) {
//     return new Promise((resolve, reject) => {
//         Tween.stopAllByTarget(flyNode);
//         tween(flyNode)
//             .delay(delayDur)
//             .to(flyDur, { position: targetPos, scale: endScale }, { easing: 'sineIn' })
//             .call(() => {
//                 resolve('');
//             })
//             .start();
//     });
// }

// // 移动到目标位置
// export async function moveToTarget(moveNode, delayDur: number, moveDur: number, targetPos: Vec3) {
//     return new Promise((resolve, reject) => {
//         Tween.stopAllByTarget(moveNode);
//         tween(moveNode)
//             .delay(delayDur)
//             .to(moveDur, { position: targetPos })
//             .call(() => {
//                 resolve('');
//             })
//             .start();
//     });
// }

// // 移动到目标位置
// export async function moveByTarget(moveNode, delayDur: number, moveDur: number, targetPos: Vec3) {
//     return new Promise((resolve, reject) => {
//         Tween.stopAllByTarget(moveNode);
//         tween(moveNode)
//             .delay(delayDur)
//             .by(moveDur, { position: targetPos })
//             .call(() => {
//                 resolve('');
//             })
//             .start();
//     });
// }

//  ------------------------------  华丽的分割线 --------------------------------
// 以下代码和游戏业务相关

// export function checkItemIsEnough(item: { itemId: number; quantity: number }, notify = true) {
//     if (DataManager.dataLwItem.itemIsEnough(item.itemId, item.quantity)) {
//         return true;
//     } else {
//         if (notify) {
//             showItemNotify(item.itemId, item.quantity);
//         }
//         return false;
//     }
// }

// export function checkItemsIsEnough(items: { [itemId: number]: number }, notify = true) {
//     const [result, itemId] = DataManager.dataLwItem.itemsIsEnough(items);
//     if (result) {
//         return true;
//     } else {
//         if (notify) {
//             showItemNotify(itemId, items[itemId]);
//         }
//         return false;
//     }
// }

// function showItemToast(itemName: string) {
//     const str = i18n.f('item_not_enough');
//     const tip = lwUtils.utils.stringFormat(str, { name: itemName });
//     ToastLw.showToast(tip);
// }


// 提前创建广告 有网友回复：多广告创建是为不同时长广告准备的
// export function prePareCreateRewardedVideoAds() {
//     let idx = 1;
//     for (const funcId in Config.AdPoint) {
//         lwUtils.utils.delaySecond(idx * 3);
//         Config.AdPoint[funcId].adId.forEach(adId => {
//             sdkUtils.createLwRewardedVideoAd(adId);
//         });
//         idx++;
//     }
// }


//计算 Label RESIZE_HEIGHT 模式下 宽度和高度
// label 传入label maxWidth最大限制
// export function calculateLabelSize(label: Label, maxWidth: number) {
//     label.overflow = Label.Overflow.NONE;
//     label.updateRenderData(true);
//     if (label.getComponent(UITransform).width <= maxWidth) {
//         return label.getComponent(UITransform).contentSize.clone();
//     }
//     label.overflow = Label.Overflow.RESIZE_HEIGHT;
//     label.getComponent(UITransform).width = maxWidth;
//     label.updateRenderData(true);
//     return label.getComponent(UITransform).contentSize.clone();
// }

// - 若小于1分钟，则显示刚刚或者在线
// - 若小于1小时，则显示X分钟前
// - 若大于等于1小时且小于24小时，则显示X小时前（不显示多出的分钟数）
// - 若大于等于24小时，在显示X天前（不显示多出的小时数）
// time 单位秒
// export function showTimesLabel(label: Label | RichText, time: number, isOnline = false) {
//     const passTime = (DataManager.getServerTime() - time * 1000) / 1000;
//     let timeDes = '';
//     if (passTime < 60) {
//         timeDes = isOnline ? i18n.f('global_time_online') : i18n.f('global_time_now');
//     } else if (passTime < 60 * 60) {
//         timeDes = Math.floor(passTime / 60) + i18n.f('global_time_second');
//     } else if (passTime < 60 * 60 * 24) {
//         timeDes = Math.floor(passTime / 60 / 60) + i18n.f('global_time_hour');
//     } else {
//         timeDes = Math.floor(passTime / 60 / 60 / 24) + i18n.f('global_time_day');
//     }
//     label.string = `${timeDes}`;
// }

// export function copyLocalText(copyStr: string) {
//     if (isMiniGame) {
//         sdkUtils.copyText(copyStr);
//     } else {
//         const el = document.createElement('textarea');
//         el.value = copyStr;
//         // Prevent keyboard from showing on mobile
//         el.setAttribute('readonly', '');
//         //el.style.contain = 'strict';
//         el.style.position = 'absolute';
//         el.style.left = '-9999px';
//         el.style.fontSize = '12pt'; // Prevent zooming on iOS
//         const selection = getSelection()!;
//         let originalRange;
//         if (selection.rangeCount > 0) {
//             originalRange = selection.getRangeAt(0);
//         }
//         document.body.appendChild(el);
//         el.select();
//         // Explicit selection workaround for iOS
//         el.selectionStart = 0;
//         el.selectionEnd = copyStr.length;
//         let success = false;
//         try {
//             success = document.execCommand('copy');
//         } catch (err) { }
//         document.body.removeChild(el);
//         if (originalRange) {
//             selection.removeAllRanges();
//             selection.addRange(originalRange);
//         }
//         ToastLw.showToast('copy_id_success');
//     }
// }

// export function setTimerCountDown(node, countdown: number) {
//     let info = '';
//     if (countdown < 60) {
//         info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.ss秒, false);
//     } else if (countdown < 3600) {
//         if (countdown % 60 === 0) {
//             //只显示 MM分
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.MM分, false);
//         } else {
//             //显示MM分ss秒
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.MM分ss秒, false);
//         }
//     } else if (countdown < 3600 * 24) {
//         if (countdown % 3600 < 60) {
//             //几时
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.HH时, false);
//         } else {
//             //几时几分
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.HH时MM分, false);
//         }
//     } else {
//         if (countdown % (3600 * 24) < 3600) {
//             //几天
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.dd天, false);
//         } else {
//             //几天几时
//             info = lwUtils.time.formatTime(countdown, CountdownTypeByLw.dd天HH时, false);
//         }
//     }
//     node.getComponent(Label).string = info;
//     return info;
// }

//创建粒子  faceType颜色大类
export async function createLizi(_type: FacePerticleType, faceType?: number) {
    // console.trace();
    //黄 蓝 【粉】 紫 橙 白  黑 彩虹
    const corlorName = ['yellow', 'blue', 'pink', 'violet', 'orange', 'white', 'black', 'colours'];
    let liziName = '';
    switch (_type) {
        case FacePerticleType.FaceFly:
            liziName = 'FX_particle001_' + corlorName[faceType - 1]
            break;
        case FacePerticleType.WordFly:
            liziName = 'FX_particle002'
            break;
        case FacePerticleType.CollectFace:
            liziName = 'FX_particle002_blast';
            break;
        case FacePerticleType.ChainLockFly:
            liziName = 'FX_particle001_star';
            break;
        default:
            break;
    }

    const nodePrefab = await LWManager.lwbundleManager.load<Prefab>("battle://particle/Prefabs/" + liziName, Prefab);
    if (!nodePrefab) {
        console.error("create new particle prefab error");
        return;
    }

    const nodeLizi = instantiate(nodePrefab);
    return nodeLizi
}

export function loadSpineData() {
    
}


/**
 * 抖动效果
 * @param node
 * @param shakeOffset 抖动偏移
 */
export function showLWShakeEffect(node: Node, frequentDur = 0.2, shakeOffset = 5) {
    const originPos = node.getPosition();
    // 抖动动画
    let getShakePosition = () => {
        const shakeX = originPos.x + (Math.random() - 0.5) * 2 * shakeOffset;
        const shakeY = originPos.y + (Math.random() - 0.5) * 2 * shakeOffset;
        return new Vec3(shakeX, shakeY, 0);
    }
    const shakeTween = tween(node)
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .to(frequentDur, { position: getShakePosition() })
        .call(() => {
            // 恢复到原始位置
            node.setPosition(originPos);
        });
    // 运行抖动动画
    tween(node).repeatForever(shakeTween).start();
}
