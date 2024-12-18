import { _decorator, Component, Node, Asset, AssetManager, AudioClip, AudioSource, Constructor, assetManager, sys } from 'cc';
import { sdkUtils } from '../../sdk-common/sdk-utils';

const { ccclass, property } = _decorator;

export class LWAudioManager extends Component {
    private static _instance: LWAudioManager;

    private GAME_MUSIC_STATE: string = 'game_music_status';
    private storage_status_by_LW: {
        music: string;
        audio: string;
        volume: number;
        shock: string;
    } | null = null;

    private _musicSourceByLw!: AudioSource;
    private _audioSourceByLw!: AudioSource;
    private _bubbleHitAudioSourceByLw!: AudioSource;

    private _musicSwitchByLw = true; //音乐
    private _audioSwitchByLw = true;//音效
    private _audioVolumeByLw = 1; // 音量
    private _shockSwitchByLw = true;

    static getInstance(rootNode: Node) {
        if (!this._instance) {

            this._instance = rootNode.addComponent(LWAudioManager);

            const audioNode = new Node('UIAudio');
            audioNode.parent = rootNode;
            this._instance._audioSourceByLw = audioNode.addComponent(AudioSource);
            this._instance._audioSourceByLw.playOnAwake = false;

            const musicNode = new Node('UIMusic');
            musicNode.parent = rootNode;
            this._instance._musicSourceByLw = musicNode.addComponent(AudioSource);
            this._instance._musicSourceByLw.playOnAwake = false;

            const bubbleHitAudioNode = new Node('BubbleHitAudio');
            bubbleHitAudioNode.parent = rootNode;
            this._instance._bubbleHitAudioSourceByLw = bubbleHitAudioNode.addComponent(AudioSource);
            this._instance._bubbleHitAudioSourceByLw.playOnAwake = false;
        }
        return this._instance;
    }

    // 初始化数据
    init() {
        const storageValue = sys.localStorage.getItem(this.GAME_MUSIC_STATE);
        if (storageValue) {
            this.storage_status_by_LW = JSON.parse(storageValue);
            this._musicSwitchByLw = this.storage_status_by_LW!.music !== 'off';
            this._audioSwitchByLw = this.storage_status_by_LW!.audio !== 'off';
            this._audioVolumeByLw = this.storage_status_by_LW!.volume;
            this._shockSwitchByLw = this.storage_status_by_LW!.shock !== 'off';
        } else {
            this.storage_status_by_LW = {
                music: this._musicSwitchByLw ? 'on' : 'off',
                audio: this._audioSwitchByLw ? 'on' : 'off',
                volume: this._audioVolumeByLw,
                shock: this._shockSwitchByLw ? 'on' : 'off',
            };
        }
    }

    async playMusicLw(musicName: string, isLoop = true) {
        if (!this.GAME_MUSIC_STATE) {
            this.init();
        }
        if (!this._musicSwitchByLw) {
            return;
        }
        if (this._musicSourceByLw.clip) {
            if (this._musicSourceByLw.clip.name === musicName) {
                // 当前背景音只有一种
                console.log('play lw_musice same', musicName);
                this._musicSourceByLw.play();
                return;
            }

        }
        if (this._musicSourceByLw) {
            console.log('stop lw_musice', this._musicSourceByLw?.clip?.name);
            this._musicSourceByLw.stop();
        }
        const audioClip: AudioClip | null = await this.load(musicName, AudioClip);
        this.scheduleOnce(() => {
            if (audioClip) {
                this._musicSourceByLw.clip = audioClip;
                this._musicSourceByLw.volume = this._audioVolumeByLw;
                this._musicSourceByLw.loop = isLoop;
                this._musicSourceByLw.play();
                console.log('start musice', this._musicSourceByLw.clip.name);
            }
        }, 0.2);
    }

    stopMusic() {
        this._musicSourceByLw.stop();
    }

    async playAudio(audioSource: AudioSource, audioName: string, audioScale = 1) {
        if (!this._audioSwitchByLw) {
            return;
        }
        //audioSource = audioSource || this._audioSourceByLw;
        if (audioSource) {
            audioSource = audioSource;
        } else {
            audioSource = this._audioSourceByLw;
        }
        const audioClip: AudioClip | null = await this.load(audioName, AudioClip);
        if (audioClip) {
            audioSource.playOneShot(audioClip, audioScale * this._audioVolumeByLw);
        }
    }

    async playBubbleHitAudio() {
        if (!this._audioSwitchByLw) {
            return;
        }
        //this._bubbleHitAudioSourceByLw.stop();
        if (this._bubbleHitAudioSourceByLw.playing) {
            this._bubbleHitAudioSourceByLw.stop();
        }
        const audioClip: AudioClip | null = await this.load('S_BubbleHit', AudioClip);
        if (audioClip) {
            this._bubbleHitAudioSourceByLw.clip = audioClip;
            this._bubbleHitAudioSourceByLw.play();
        }


        // if (!this._audioSwitchByLw) {
        //     return;
        // }
        // const audioClip: AudioClip | null = await this.load('S_BubbleHit', AudioClip);
        // this.scheduleOnce(() => {
        //     if (!this._audioSwitchByLw) {
        //         return;
        //     }
        //     this._bubbleHitAudioSourceByLw.stop();
        //     // if(this._bubbleHitAudioSourceByLw.playing){
        //     //     console.log(1111111111111111111111111111111111111111111111)
        //     //     this._bubbleHitAudioSourceByLw.stop();
        //     // }
        //    // const audioClip: AudioClip | null = await this.load('S_BubbleHit', AudioClip);
        //     if (audioClip) {
        //         this._bubbleHitAudioSourceByLw.playOneShot(audioClip, 1 * this._audioVolumeByLw);
        //     }
        // });
    }

    playShock() {
        if (!this._shockSwitchByLw) {
            return;
        }
        sdkUtils.vibrateLwShort();
    }

    resume() {
        console.log('AudioResume');
        if (this._musicSwitchByLw) {
            this._musicSourceByLw.play();
        }
    }

    pause() {
        console.log('pauseResume');
        if (this._musicSwitchByLw) {
            this._musicSourceByLw.pause();
        }
    }

    // 切换状态
    switchLwMusicStatus(musicState: boolean) {
        this._musicSwitchByLw = musicState;
    }

    // 切换状态
    switchLwAudioStatus(audioState: boolean) {
        this._audioSwitchByLw = audioState;
    }

    // 切换震动状态
    switchShockStatus(shockState: boolean) {
        this._shockSwitchByLw = shockState;
    }

    // 修改音量大小
    changeLwVolume(volume: number) {
        this._audioVolumeByLw = volume;
    }

    // 加载
    private load<T extends Asset>(path: string, type: Constructor<T> | null): Promise<T> {
        return new Promise((resolve, reject) => {
            const bundleName = 'audio';
            let bundle = assetManager.getBundle(bundleName);
            if (!bundle) {
                const options: { [key: string]: string } = {};
                assetManager.loadBundle(bundleName, options, (err: Error, assetBundle: AssetManager.Bundle) => {
                    if (err) {
                        console.warn('加载包：' + bundleName + ' => 失败');
                        reject(err);
                        return;
                    }
                    bundle = assetBundle;
                    console.log('请求加载' + path);
                    bundle.load(path, (err, data: Asset) => {
                        console.log('加载包：' + path + ' => success');
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data as T);
                        }
                    });
                });
            } else {
                bundle.load(path, (err, data: Asset) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data as T);
                    }
                });
            }
        });
    }


    // 保存状态
    saveLwAudioStatus() {
        this.storage_status_by_LW = {
            music: this._musicSwitchByLw ? 'on' : 'off',
            audio: this._audioSwitchByLw ? 'on' : 'off',
            volume: this._audioVolumeByLw,
            shock: this._shockSwitchByLw ? 'on' : 'off',
        };

        sys.localStorage.setItem(this.GAME_MUSIC_STATE, JSON.stringify(this.storage_status_by_LW));
    }



    //获取音效状态
    getLwAudioStatus() {
        return {
            music: this._musicSwitchByLw,
            audio: this._audioSwitchByLw,
            shock: this._shockSwitchByLw,
        };
    }

}
