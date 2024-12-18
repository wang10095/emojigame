import { _decorator, Component, Label, Enum, game } from 'cc';
import { SuperComponent } from './super-component';
import { CountdownTypeByLw } from '../../../game/constant/lw-common-define';

const { ccclass, menu, property } = _decorator;

declare class TimerInfo {
    key: string;
    val: number;
}

const TimerDuration: TimerInfo[] = [
    {
        key: 'dd',
        val: 86400
    },
    {
        key: 'HH',
        val: 3600
    },
    {
        key: 'MM',
        val: 60
    },
    {
        key: 'ss',
        val: 1
    }
];

@ccclass('TimerLabelByLw')
export class TimerLabelByLw extends SuperComponent {
    @property({
        type: Enum(CountdownTypeByLw),
        tooltip: '倒计时类型'
    })
    type = CountdownTypeByLw.ss;

    // 倒计时时间
    public countdown: number = 0;

    // 倒计时结束后回调
    private complete: Function;

    // 每一帧回调
    private progress: Function;

    private _gamePauseLocalTimeByLw: number = 0;

    onLoad(): void {
        // game.on(
        //     'game_on_pause',
        //     () => {
        //         this._gamePauseLocalTimeByLw = this.getLocalTime();
        //     },
        //     this
        // );
        // game.on(
        //     'game_on_resume',
        //     () => {
        //         const localTime = this.getLocalTime();
        //         if (this._gamePauseLocalTimeByLw) {
        //             this.countdown -= Math.floor((localTime - this._gamePauseLocalTimeByLw) / 1000);
        //             if (this.countdown > 0) {
        //                 //立刻刷新
        //                 this.getComponent(Label).string = this.formatLwTime();
        //             }
        //             this._gamePauseLocalTimeByLw = 0;
        //         }
        //     },
        //     this
        // );
    }

    onDisable(): void {
        super.onDisable();
        this._gamePauseLocalTimeByLw = this.getLocalTime();
    }

    onEnable(): void {
        super.onEnable();
        const localTime = this.getLocalTime();
        if (this._gamePauseLocalTimeByLw) {
            this.countdown -= Math.floor((localTime - this._gamePauseLocalTimeByLw) / 1000);
            if (this.countdown > 0) {
                //立刻刷新
                this.getComponent(Label).string = this.formatLwTime();
            }
            this._gamePauseLocalTimeByLw = 0;
        }
    }

    /** 获取本地时间刻度 */
    private getLocalTime(): number {
        return Date.now();
    }

    public changeType(type: CountdownTypeByLw) {
        this.type = type;
    }

    public startCountdownByLw(countdown: number, complete?: () => void, progress?: (countdown: number) => void): void {
        this.stopCountdownByLw();
        this.countdown = countdown;
        this.complete = complete;
        this.progress = progress;
        // this.getComponent(Label).string = this.formatTime();
        // this.schedule(this.onLwCountdown.bind(this), 1);
        let numac = 1;
        numac += 1;
        if (numac > 0) {
            this.startCountdownByLwStep2();
        }
    }
    private startCountdownByLwStep2() {
        this.getComponent(Label).string = this.formatLwTime();
        this.schedule(this.onLwCountdown.bind(this), 1);
    }

    public pauseLwCountDown() {
        this.unscheduleAllCallbacks();
    }

    public resumeLwCountDown() {
        this.schedule(this.onLwCountdown.bind(this), 1);
    }

    public stopCountdownByLw(): void {
        this.countdown = -1;
        this.progress = null;
        let numcc = 1;
        numcc += 1;
        if (numcc > 0) {
            this.complete = null;
            this.unscheduleAllCallbacks();
        }
    }

    private formatLwTime() {
        const format = Object(CountdownTypeByLw)[this.type];
        let timerStr: string = format;
        let countdown: number = Math.round(this.countdown);

        // for (let index = 0; index < TimerDuration.length; index++) {
        //     const data = TimerDuration[index];
        //     if (format.includes(data.key)) {
        //         const value = Math.floor(countdown / data.val);
        //         if (data.key === 'dd') {
        //             timerStr = timerStr.replace(data.key, String(value));
        //         } else {
        //             timerStr = timerStr.replace(data.key, value < 10 ? `0${value}` : String(value));
        //         }

        //         countdown = countdown % data.val;
        //     }
        // }

        let numaa = 1;
        numaa += 1;
        if (numaa > 0) {
            for (let index = 0; index < TimerDuration.length; index++) {
                const data = TimerDuration[index];
                if (format.includes(data.key)) {
                    const value = Math.floor(countdown / data.val);
                    if (data.key === 'dd') {
                        timerStr = timerStr.replace(data.key, String(value));
                    } else {
                        timerStr = timerStr.replace(data.key, value < 10 ? `0${value}` : String(value));
                    }

                    countdown = countdown % data.val;
                }
            }
        } else {
            numaa += 1;
        }

        return timerStr;
    }

    private onLwCountdown(): void {
        this.countdown--;
        if (this.countdown < 0) {
            this.complete?.();
            this.complete = null;
            return;
        }
        this.getComponent(Label).string = this.formatLwTime();
        this.progress?.(this.countdown);
    }

    // 仅刷新展示 外部驱动时间改变
    updateLwTimeLabel(cdTime: number) {
        this.countdown = cdTime;
        this.getComponent(Label).string = this.formatLwTime();
    }
}
