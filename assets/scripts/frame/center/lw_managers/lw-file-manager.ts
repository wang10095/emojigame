import { native, _decorator, assetManager, path, BufferAsset, ImageAsset, SpriteFrame, Enum, Texture2D } from 'cc';
import lwUtils from '../lw_utils/lw-utils';
import { isMiniGame } from '../../../game/lw-game-define';


var REGEX = /^https?:\/\/.*/;
let fsUtils = window.fsUtils;
var exists = fsUtils ? fsUtils.exists : native.fileUtils ? native.fileUtils.isFileExist : () => { return false; }; //jsb.FileUtils.getUserDataPath;
var getUserDataPath = fsUtils ? fsUtils.getUserDataPath : native.fileUtils ? () => { return native.fileUtils.getWritablePath().replace(/[\/\\]*$/, ''); } : () => "null"; //jsb.FileUtils.getUserDataPath;
var downloadFile = fsUtils ? fsUtils.downloadFile : null;
var cacheManager = assetManager.cacheManager;

function doNothing(content, options, onComplete) {
    if (isMiniGame) {
        exists(content, function (existence) {
            if (existence) {
                onComplete(null, content);
            } else {
                onComplete(new Error("file ".concat(content, " does not exist!")), null);
            }
        });
    } else {
        onComplete(null, content);
    }
}

function transformLwUrl(url, fileKey, options) {
    var inLocal = false;
    var inCache = false;
    if (isMiniGame) {
        var isInUserDataPath = url.startsWith(getUserDataPath());

        if (isInUserDataPath) {
            inLocal = true;
        } else if (REGEX.test(url)) {
            if (!options.reload) {
                var cache = cacheManager.cachedFiles.get(fileKey);

                if (cache) {
                    inCache = true;
                    url = cache.url;
                } else {
                    var tempUrl = cacheManager.tempFiles.get(fileKey);

                    if (tempUrl) {
                        inLocal = true;
                        url = tempUrl;
                    }
                }
            }
        } else {
            inLocal = true;
        }
    }

    return {
        url: url,
        fileKey: fileKey,
        inLocal: inLocal,
        inCache: inCache
    };
}

function download(url, saveFilePath, ext, options, onFileProgress, onComplete) {
    let fileKey = url;
    if (isMiniGame) {
        var result = transformLwUrl(url, fileKey, options);

        if (result.inLocal) {
            doNothing(result.url, options, onComplete);
        } else if (result.inCache) {
            cacheManager.updateLastTime(fileKey);
            doNothing(result.url, options, function (err, data) {
                if (err) {
                    cacheManager.removeCache(fileKey);
                }

                onComplete(err, data);
            });
        } else {
            downloadFile(url, saveFilePath, options.header, onFileProgress, function (err, path) {
                if (err) {
                    onComplete(err, null);
                    return;
                }

                doNothing(path, options, function (err, data) {
                    if (!err) {
                        cacheManager.tempFiles.add(fileKey, path);
                        cacheManager.cacheFile(fileKey, path, options.cacheEnabled, options.__cacheBundleRoot__, true);
                    }

                    onComplete(err, data);
                });
            });
        }
    } else {
        assetManager.downloader.download(fileKey, url, ext, options, function (err, data) {
            if (err) {
                onComplete(err, null);
                return;
            }
            onComplete(err, data);
        });
    }
}

// export class Singleton {
//     public static getInstance<T extends {}>(this: new () => T): T {
//         if (!(<any>this).instance) {
//             (<any>this).instance = new this();
//         }
//         return (<any>this).instance;
//     }
// }

export class LWFileManager extends lwUtils.Singleton {
    private _cachedTextures: { [key: string]: Texture2D } = {};
    constructor() {
        super();
    }

    download(url: string, ext: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: any | null) => void)) {
        download(url, null, ext ? ext : options?.ext, options, null, onComplete);
    }

    parse(id: string, file: any, ext: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: any | null) => void)) {
        assetManager.parser.parse(id, file, ext, options, (err, data) => {
            if (err) {
                onComplete(err, null);
            } else {
                assetManager.factory.create(id, data, ext, options, onComplete);
            }
        });
    }

    downloadAndParse(url: string, ext: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: any | null) => void)) {
        if (isMiniGame) {
            this.download(url, ext, options, (err, filePath: string) => {
                if (err) {
                    onComplete(err, null);
                } else {
                    this.parse(url, filePath, ext, options, onComplete);
                }
            });
        } else {
            assetManager.loadRemote(url, { ext: ext, reloadAsset: true, reload: true }, onComplete);
        }
    }

}