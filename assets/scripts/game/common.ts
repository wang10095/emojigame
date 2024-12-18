import { Director } from "cc";
import { director } from "cc";
import { ExcelConfigParser } from "./excel-config-parser";

//在本次物理计算后回调
export function eventAfterPhysics(callBack) {
    director.once(Director.EVENT_AFTER_PHYSICS, () => {
        if (callBack) {
            callBack();
        }
    })
}


export function G_getSpineFps() {
    return 0.033
}


// export function getRandomInt2(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

export function getRandomInt(min, max) {
    // 确保min小于max
    if (min > max) {
        [min, max] = [max, min];
    }

    // 创建一个包含所有可能值的数组
    const values = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    // 打乱数组的顺序
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    // 从打乱后的数组中依次取出元素（这里使用简单的计数器来模拟）
    let currentIndex = 0;
    function getNextRandomInt() {
        if (currentIndex < values.length) {
            return values[currentIndex++];
        } else {
            // 如果所有元素都被取完了，重新打乱数组并重置计数器
            for (let i = values.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [values[i], values[j]] = [values[j], values[i]];
            }
            currentIndex = 0;
            return values[currentIndex++];
        }
    }

    // 返回获取下一个随机整数的函数
    return getNextRandomInt();
}


export function getGlobalCfgValue(key: string) {
    return ExcelConfigParser.getInstance().getGlobalCfgValue(key);
}