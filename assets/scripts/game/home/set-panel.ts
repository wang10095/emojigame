import { _decorator, Node, Label, UITransform, find, Color, view, Widget, v3, sys, Sprite, isValid, UIOpacity, director, Toggle } from 'cc';


import { SuperPanel } from '../../frame/center/lw_components/super-panel';
import { LWManager } from '../../frame/center/lw-manager';
import { DataManager } from '../data/data-manager';
import lwUtils from '../../frame/center/lw_utils/lw-utils';
import { gotoLWScene } from '../ui-commonset';
import { uiManager } from '../../frame/center/lw_managers/ui-manager';
import { UI_NAME } from '../constant/lw-common-define';
const { ccclass, property } = _decorator;

@ccclass('SetPanel')
export class SetPanel extends SuperPanel {
    @property({
        type: Node
    })
    nodePrivacy: Node = null;

    @property({
        type: Toggle
    })
    effectSwitch: Toggle = null;

    @property({
        type: Toggle
    })
    musicSwitch: Toggle = null;

    @property({
        type: Toggle
    })
    shockSwitch: Toggle = null;


    start() {
        super.start();
        this.LWRegisterMyEmit(
            [

            ],
            [

            ],
            this
        );

        this.nodePrivacy.active = false;

        this.outArea.getChildByName('btn_privacy').active = DataManager.currentSceneName === 'home';
        this.outArea.getChildByName('layout_btn').active = DataManager.currentSceneName === 'battle';

        this.initAudioSwitch();

    }

    //初始化音效按钮状态
    private initAudioSwitch() {
        const switchState = LWManager.lwaudioManager.getLwAudioStatus();
        this.effectSwitch.isChecked = switchState.audio;
        this.musicSwitch.isChecked = switchState.music;
        this.shockSwitch.isChecked = switchState.shock;

        // const profilerStatus = lwUtils.storage.getItem('spine_profiler') !== 'false';
        // this.profilerSwitch.isChecked = profilerStatus;
        // this.initSetting = false;
    }


    onClickPrivacy() {
        this.nodePrivacy.active = true;
    }

    onDestroy(): void {
        super.onDestroy();
    }

    async onClickBackHome() {


        this.close();
        uiManager.show(UI_NAME.GameFailPanel);
    }

    onClickSwitchEffect() {
        LWManager.lwaudioManager.switchLwAudioStatus(this.effectSwitch.isChecked);
    }

    onClickSwitchMuisc() {
        LWManager.lwaudioManager.switchLwMusicStatus(this.musicSwitch.isChecked);
        if (this.musicSwitch.isChecked) {
            LWManager.lwaudioManager.playMusicLw('S_BGmusic');
        } else {
            LWManager.lwaudioManager.stopMusic();
        }
    }

    onClickSwitchShock() {
        LWManager.lwaudioManager.switchShockStatus(this.shockSwitch.isChecked);
    }

    close() {
        super.close();
        LWManager.lwaudioManager.saveLwAudioStatus();
    }

}
