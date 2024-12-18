

import { LWManager} from '../../frame/center/lw-manager';
// import { AxiosManager, GameMessage } from '../../frame/center/net/AxiosManager';
// import { SocketIo } from '../../frame/center/net/Socket-io';

export abstract class SuperData {
    abstract name;
    // 网络返回处理
    netMessageHanders = {};

    constructor() { }

    public init(...args: any[]): void {
        // for (const messageName in this.netMessageHanders) {
        //     const messageHandler = this.netMessageHanders[messageName];
        //     AxiosManager.registerMessage(messageName, messageHandler);
        // }
    }

    protected lwSendMessage(messageCode: number, messageData: any) {
        // const gameMessage: GameMessage = {
        //     messageCode: messageCode,
        //     data: messageData
        // };
        // AxiosManager.sendMessage(gameMessage);
    }

    protected lwSendSocketMessage(messageCode: number, messageData: any) {
        // const gameMessage: GameMessage = {
        //     messageCode: messageCode,
        //     data: messageData
        // };
        // SocketIo.sendSocketMessage(gameMessage);
    }

    /**
     * 派发事件
     * @param eventName
     * @param args
     */
    protected lwDispatchEmit(propertyName: string, ...args: any[]) {
        const eventName = [this.name, propertyName].join('_');
        LWManager.lweventManager.emitLw(eventName, ...args);
    }

    /**
     * 派发事件
     * @param eventName
     * @param args
     */
    protected lwDispatchUIEmit(eventName: string, ...args: any[]) {
        LWManager.lweventManager.emitLw(eventName, ...args);
    }

    public clear(): void {
        LWManager.lweventManager.targetOff(this);

        // for (const messageName in this.netMessageHanders) {
        //     const messageHandler = this.netMessageHanders[messageName];
        //     AxiosManager.unRegisterMessage(messageName, messageHandler);
        // }
    }
}
