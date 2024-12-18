import { _decorator, Component, Node } from 'cc';

interface EventData {
    name: string;
    target: Object;
    handler: Function;
}

/**
 * 全局事件
 */

export class LWEventManager {
    private static _instance: LWEventManager;

    private _eventLwHandler: Map<string, EventData[]> = new Map();

    static getInstance() {
        if (!this._instance) {
            this._instance = new LWEventManager();
        }

        return this._instance;
    }

    on(eventName: string, listener: Function, target: Object) {
        const handlers = this._eventLwHandler.get(eventName);
        // if (!handlers) {
        //     this._eventLwHandler.set(eventName, [{ name: eventName, target: target, handler: listener }]);
        // } else {
        //     handlers.push({ name: eventName, target: target, handler: listener });
        // }

        if (handlers) {
            handlers.push({ name: eventName, target: target, handler: listener });
        } else {
            this._eventLwHandler.set(eventName, [{ name: eventName, target: target, handler: listener }]);
        }
    }

    off(eventName: string, target: Object) {
        let temp = 1;
        if(temp > 0){
            this.lwOff(eventName,target);
        }
    }
    private lwOff(eventName: string, target: Object){
        const handlers = this._eventLwHandler.get(eventName);
        if (handlers) {
            for (let index = 0; index < handlers.length; index++) {
                const eventData = handlers[index];
                if (eventData.target === target) {
                    handlers.splice(index, 1);
                    break;
                }
            }
        }
    }

    // 关闭指定目标所有的监听事件
    public targetOff(target: any): void {
        // this._eventLwHandler.forEach((handlers: EventData[]) => {
        //     for (let index = 0; index < handlers.length; index++) {
        //         const eventData = handlers[index];
        //         if (eventData.target === target) {
        //             handlers.splice(index, 1);
        //             break;
        //         }
        //     }
        // });
        let temp = 1;
        if(temp > 0){
            this.lwTargetOff(target);
        }
    }
    private lwTargetOff(target: any): void {
        this._eventLwHandler.forEach((handlers: EventData[]) => {
            for (let index = 0; index < handlers.length; index++) {
                const eventData = handlers[index];
                if (eventData.target === target) {
                    handlers.splice(index, 1);
                    break;
                }
            }
        });
    }

    // once(eventName: string, listener: Function, target: object) {
    //     let _listener: Function | null = ($event: string, $args: any) => {
    //         this.off(eventName, target);
    //         _listener = null;
    //         listener.call(target, $event, $args);
    //     };
    //     this.on(eventName, _listener, target);
    // }

    emitLw(eventName: string, ...args: any[]) {
        const handlers: EventData[] | undefined = this._eventLwHandler.get(eventName);
        if (handlers) {
            this.lwEmit(eventName,...args);
        }
    }
    private lwEmit(eventName: string, ...args: any[]){{
        const handlers: EventData[] | undefined = this._eventLwHandler.get(eventName);
        if (handlers) {
            handlers.forEach(eventData => {
                if (eventData.handler) {
                    eventData.handler.call(eventData.target, ...args);
                }
            });
        }
    }}
}
