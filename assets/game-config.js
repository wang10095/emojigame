{
    let LWGlobal;
    try {
        if (LWGlobal) {
            LWGlobal = GameGlobal;
        }
    } catch (e) { }
    try {
        if (!LWGlobal) {
            LWGlobal = window;
        }
    } catch (e) {
        console.error('未能找到全局根对象！');
    }

    LWGlobal.gameServerUrl = ''; // 默认正式服
    LWGlobal.gameVersion = '9.9.9';
    LWGlobal.gameBuildTime = '08011410';
    LWGlobal.getGameGlobal = () => LWGlobal;
}
