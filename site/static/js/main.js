"use strict";
class GoogleAPIHandler {
    constructor(apiKey = "", clientId = "") {
        this.isAuthAPIReady = false;
        this.isYoutubeDataAPIReady = false;
        this.apiKey = apiKey;
        this.clientId = clientId;
    }
    setAPIKey(key) {
        this.isYoutubeDataAPIReady = false;
        this.apiKey = key;
    }
    setClientId(id) {
        this.isAuthAPIReady = false;
        this.clientId = id;
    }
    LoadAuthAPI() {
        var that = this;
        gapi.auth2.init({ client_id: this.clientId }).then(function (auth) {
            that.isAuthAPIReady = true;
            that.auth = auth;
        }, function (reason) {
            that.isAuthAPIReady = false;
            toastr.warning(`ERROR: ${reason.details}`, "Auth API");
            console.error(`Failed to load Auth API: ${reason.details}`);
        });
    }
    Authorize() {
        if (!this.isAuthAPIReady || !this.auth) {
            console.error("Unable to open signin window, auth api not loaded. Call LoadAuthAPI before calling Authorize");
            toastr.warning("No Client Id Specificed, Authorize Will be disabled until a valid Client Id is supplied", "Auth");
            return;
        }
        var that = this;
        this.auth.signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" }).then(function () {
            that.isAuthAPIReady = true;
            toastr.success("Authorization Sucessful", "Sign-In");
        }, function (reason) {
            that.isAuthAPIReady = false;
            toastr.error(`Error: ${reason.error}`, "Sign-In");
            console.error(`Error when Signing In, Reason: ${reason.error}`);
        });
    }
    LoadYoutubeAPI() {
        if (!this.apiKey) {
            console.log("No API Key Specificed");
            Utils.SetCurrentStatusMessage("ERROR: No API Key Specificed", false);
            toastr.error("Error: No API Key Specificed. Please Supply an API Key in Advanced Settings", "Initialize");
        }
        var that = this;
        gapi.client.setApiKey(this.apiKey);
        Utils.SetCurrentStatusMessage("Loading API", true);
        gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3").then(function () {
            that.isYoutubeDataAPIReady = true;
            Utils.SetCurrentStatusMessage("Ready", false);
            console.log("Youtube Data API Ready");
        }, function (reason) {
            that.isYoutubeDataAPIReady = false;
            Utils.SetCurrentStatusMessage(`API ERROR: ${reason.error.message}`, false);
            toastr.error(`Failed to Load Youtube API. ${reason.error.message}`, "Youtube API");
            console.error(`Failed to load API, Reason: ${reason.error.message}`);
        });
    }
}
let shuffler;
function main() {
    let apiKey = Utils.GetCookie("APIKey") || "AIzaSyCy1ZyZplO51YBnzJGgkwrQj-WHi4rfgNs";
    let clientId = Utils.GetCookie("ClientId") || "1016829549874-skkprhf6gt3i7l1r7979s9abc3tq4och.apps.googleusercontent.com";
    shuffler = new YoutubePlaylistShuffler(apiKey, clientId);
}
window.onload = function () {
    gapi.load("client:auth2", main);
};
var SaveType;
(function (SaveType) {
    SaveType[SaveType["Queued"] = 0] = "Queued";
    SaveType[SaveType["Completed"] = 1] = "Completed";
})(SaveType || (SaveType = {}));
class ProgressHandler {
    constructor() {
        this.youtubeDataAPI = new YoutubeDataAPIHandler();
    }
    DoSavedProgressExist() {
        return localStorage.getItem("savedProgress") != null;
    }
    GetSavedProgress(callback) {
        let savedProgress = localStorage.getItem("savedProgress");
        if (!savedProgress) {
            return null;
        }
        let saved = JSON.parse(savedProgress);
        var fetchedItems = [];
        var fetchTargets = Object.keys(saved.data);
        var fetchIteration = 0;
        var targetIteration = fetchTargets.length;
        var that = this;
        function ProcessFetchedItems() {
            var playlistCompleted = [];
            var playlistQueued = [];
            // Completed means the SaveData.itmes stores list of video positions that has been played
            fetchedItems.forEach(element => {
                // Performace increase? Maybe
                let items = new Set(saved.data[element.playlistId]);
                element.items.forEach(e => {
                    // Short Circuit Evaulation
                    if (e.snippet && e.snippet.position && items.has(e.snippet.position)) {
                        let _ = saved.type === SaveType.Completed ? playlistCompleted.push(e) : playlistQueued.push(e);
                    }
                    else {
                        let _ = saved.type === SaveType.Completed ? playlistQueued.push(e) : playlistCompleted.push(e);
                    }
                });
            });
            callback({ "completed": playlistCompleted, "queued": playlistQueued });
        }
        // Because saved.data stores value in {playlistId: positions[]}, element is alreay playlistId
        function FetchItems() {
            let target = fetchTargets[fetchIteration];
            that.youtubeDataAPI.FetchPlaylistItems(target, function (data) {
                var item = {
                    "playlistId": target,
                    "items": data
                };
                fetchedItems.push(item);
                fetchIteration++;
                if (fetchIteration === targetIteration) {
                    ProcessFetchedItems();
                }
                else {
                    FetchItems();
                }
            });
        }
        FetchItems();
    }
    SaveProgrss(playlistCompleted, playlistQueued) {
        let saveType = playlistCompleted.length < playlistQueued.length ? SaveType.Completed : SaveType.Queued;
        let data = {};
        let saveList = saveType === SaveType.Completed ? playlistCompleted : playlistQueued;
        saveList.forEach(element => {
            var _a, _b;
            if (((_a = element === null || element === void 0 ? void 0 : element.snippet) === null || _a === void 0 ? void 0 : _a.playlistId) && ((_b = element === null || element === void 0 ? void 0 : element.snippet) === null || _b === void 0 ? void 0 : _b.position)) {
                let playlistId = element.snippet.playlistId;
                let videoPosition = element.snippet.position;
                if (data[playlistId] === undefined) {
                    data[playlistId] = [videoPosition];
                }
                else {
                    data[playlistId].push(videoPosition);
                }
            }
        });
        let saveData = {
            "type": saveType,
            "data": data
        };
        toastr.success(`Progress Saved. (${Object.keys(saveData.data).length} Playlists)`, "Progress");
        localStorage.setItem("savedProgress", JSON.stringify(saveData));
    }
    DiscardProgress() {
        var discard = true;
        // Make copy of object that is not a reference;
        let option = Object.create(toastr.options);
        var that = this;
        option.onclick = function () {
            discard = false;
            toastr.info("Discard Aborted", "Progress");
        };
        option.onHidden = function () {
            if (discard) {
                that.DiscardProgressActual();
                toastr.error("Saved playlist Discarded", "Progress");
            }
        };
        toastr.warning("Saved Progress will be discarded in 10 seconds. <br>Click here to cancel", "Progress", option);
    }
    DiscardProgressActual() {
        localStorage.removeItem("savedProgress");
    }
}
var Interaction;
(function (Interaction) {
    let PlaylistPlayAction;
    (function (PlaylistPlayAction) {
        PlaylistPlayAction[PlaylistPlayAction["NORMAL"] = 0] = "NORMAL";
        PlaylistPlayAction[PlaylistPlayAction["MERGE"] = 1] = "MERGE";
        PlaylistPlayAction[PlaylistPlayAction["REPLACE"] = 2] = "REPLACE";
    })(PlaylistPlayAction = Interaction.PlaylistPlayAction || (Interaction.PlaylistPlayAction = {}));
    let VideoOperation;
    (function (VideoOperation) {
        VideoOperation[VideoOperation["NEXT"] = 0] = "NEXT";
        VideoOperation[VideoOperation["REPEAT"] = 1] = "REPEAT";
    })(VideoOperation = Interaction.VideoOperation || (Interaction.VideoOperation = {}));
    let SaveOperation;
    (function (SaveOperation) {
        SaveOperation[SaveOperation["SAVE"] = 0] = "SAVE";
        SaveOperation[SaveOperation["DISCARD"] = 1] = "DISCARD";
        SaveOperation[SaveOperation["IGNORE"] = 2] = "IGNORE";
        SaveOperation[SaveOperation["LOAD"] = 3] = "LOAD";
    })(SaveOperation = Interaction.SaveOperation || (Interaction.SaveOperation = {}));
})(Interaction || (Interaction = {}));
class UIManager {
    constructor(onPlaylistAction, onVideoAction, onSaveAction, onAdvFormSubmit) {
        this.advSettingsForm = $("#apiConfig");
        this.onPlaylistAction = onPlaylistAction;
        this.onVideoAction = onVideoAction;
        this.onSaveAction = onSaveAction;
        this.onAdvFormSubmit = onAdvFormSubmit;
        this.SetToastrOption();
    }
    SetToastrOption() {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 2000;
        toastr.options.progressBar = true;
    }
    BindElements() {
        this.BindPlaylistOpElements();
        this.BindSaveOpElements();
        this.BindVideoOpElements();
    }
    SetAdvancedSettingModalData(apiKey, clientId) {
        $("#clientIdInput").val(clientId || "");
        $("#apiKeyInput").val(apiKey || "");
    }
    OnAdvancedSettingsSubmit() {
        var that = this;
        this.advSettingsForm.on("submit", function (e) {
            e.preventDefault();
            let result = {};
            that.advSettingsForm.serializeArray().forEach(element => {
                result[element.name] = element.value;
            });
        });
    }
    BindPlaylistOpElements() {
        var that = this;
        $("#play-playlist").on("click", function (event) {
            let data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.NORMAL, data);
        });
        $("#playlist-op-replace").on("click", function (event) {
            let data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.REPLACE, data);
        });
        $("#playlist-op-merge").on("click", function (event) {
            let data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.MERGE, data);
        });
    }
    BindVideoOpElements() {
        var that = this;
        $("#video-repeat").on("click", function (event) {
            that.onVideoAction(Interaction.VideoOperation.REPEAT, undefined);
        });
        $("#video-next").on("click", function (event) {
            that.onVideoAction(Interaction.VideoOperation.NEXT, undefined);
        });
    }
    BindSaveOpElements() {
        var that = this;
        $("#save-progress").on("click", function (event) {
            that.onSaveAction(Interaction.SaveOperation.SAVE, undefined);
        });
        $("#saved-load").on("click", function (event) {
            that.onSaveAction(Interaction.SaveOperation.LOAD, undefined);
        });
        $("#saved-ignore").on("click", function (event) {
            that.onSaveAction(Interaction.SaveOperation.IGNORE, undefined);
        });
        $("#saved-discard").on("click", function (event) {
            that.onSaveAction(Interaction.SaveOperation.DISCARD, undefined);
        });
    }
    ShowActivePlaylistOpModal() {
        $("#playlistExistOp").modal("show");
    }
    ShowProgressOpModal() {
        $("#playlistSavedAskOp").modal("show");
    }
}
var Utils;
(function (Utils) {
    function GetQueryParams(qs, name) {
        try {
            let url = new URL(qs);
            return url.searchParams.get(name);
        }
        catch (e) {
            return null;
        }
    }
    Utils.GetQueryParams = GetQueryParams;
    function SetCurrentStatusMessage(message, enableSpinner) {
        document.getElementById("status-message").innerText = message;
        let spinElement = $("#status-spin");
        if (enableSpinner) {
            if (spinElement.hasClass("d-none"))
                spinElement.removeClass("d-none");
        }
        else {
            if (!spinElement.hasClass("d-none"))
                spinElement.addClass("d-none");
        }
    }
    Utils.SetCurrentStatusMessage = SetCurrentStatusMessage;
    function GetCookie(name) {
        var _a;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2)
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
    }
    Utils.GetCookie = GetCookie;
    function SetCookie(name, value) {
        document.cookie = `${name}=${value}; expires=Fri, 31 Dec 2037 23:59:59 GMT`;
    }
    Utils.SetCookie = SetCookie;
    function Shuffle(arr) {
        let i = arr.length, j, temp;
        while (--i > 0) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
    }
    Utils.Shuffle = Shuffle;
})(Utils || (Utils = {}));
class YoutubeDataAPIHandler {
    constructor() { }
    GetPlaylistDetails(playlistId, pageToken = "", parts = ["snippet"]) {
        return gapi.client.youtube.playlistItems.list({
            "part": parts,
            "maxResults": 50,
            "pageToken": pageToken,
            "playlistId": playlistId
        });
    }
    FetchPlaylistItems(playlistId, callback, fetchedItems = [], pageId = undefined) {
        // let fetchedItems: gapi.client.youtube.PlaylistItem[] = [];
        // let respPageId: (string | undefined);
        var that = this;
        this.GetPlaylistDetails(playlistId, pageId).then(function (resp) {
            var _a;
            pageId = resp.result.nextPageToken;
            if (!resp.result.items) {
                console.log("No Items in the result set??");
            }
            else {
                fetchedItems.push(...resp.result.items);
            }
            Utils.SetCurrentStatusMessage(`Fetching Playlist ${fetchedItems.length}/${(_a = resp.result.pageInfo) === null || _a === void 0 ? void 0 : _a.totalResults}`, true);
            if (pageId) {
                that.FetchPlaylistItems(playlistId, callback, fetchedItems, pageId);
            }
            else {
                callback(fetchedItems);
            }
        }, function (err) {
            console.error(`Error fetching playlist: ${err.result.error.message}`);
            toastr.error(`ERROR: ${err.result.error.message}`, "Playlist");
        });
    }
}
class YoutubePlayerAPIHandler {
    constructor(onPlayerStateChangeCallback, onPlayerReadyCallback) {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
        this.onPlayerReadyCallback = onPlayerReadyCallback;
    }
    PlayVideo(videoId) {
        var that = this;
        if (this.player === undefined) {
            this.player = new YT.Player('player', {
                videoId: videoId,
                events: {
                    'onReady': function (event) {
                        that.onPlayerReadyCallback(event);
                    },
                    'onStateChange': function (event) {
                        that.onPlayerStateChangeCallback(event);
                    }
                }
            });
        }
        else {
            this.player.loadVideoById(videoId);
        }
    }
    Init() {
        console.log("INITIZING PLAYER IFRAME");
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}
class YoutubePlaylistShuffler {
    constructor(apiKey, clientId) {
        this.playlistItemsQueued = [];
        this.playlistItemsCompleted = [];
        this.uiManager = new UIManager(this.OnPlaylistPlay, this.OnVideoAction, this.OnSaveOperation, this.OnAdvSettingsSubmit);
        this.uiManager.BindElements();
        this.uiManager.SetAdvancedSettingModalData(apiKey, clientId);
        this.googleAPIHandler = new GoogleAPIHandler(apiKey, clientId);
        this.googleAPIHandler.LoadYoutubeAPI();
        this.googleAPIHandler.LoadAuthAPI();
        this.youtubeDataHandler = new YoutubeDataAPIHandler();
        this.youtubePlayerHandler = new YoutubePlayerAPIHandler(this.onYoutubePlayerStateChange, this.onYoutubePlayerReady);
        this.youtubePlayerHandler.Init();
        this.progressHandler = new ProgressHandler();
        if (this.progressHandler.DoSavedProgressExist()) {
            this.uiManager.ShowProgressOpModal();
        }
    }
    OnPlaylistPlay(type, data) {
        shuffler.PlayPlaylist(data, type);
    }
    OnVideoAction(type, data) {
        switch (type) {
            case Interaction.VideoOperation.NEXT:
                shuffler.PlayNextVideo();
                break;
            case Interaction.VideoOperation.REPEAT:
                shuffler.RepeatVideo();
                break;
            default:
                break;
        }
    }
    OnSaveOperation(type, data) {
        switch (type) {
            case Interaction.SaveOperation.SAVE:
                shuffler.progressHandler.SaveProgrss(shuffler.playlistItemsCompleted, shuffler.playlistItemsQueued);
                break;
            case Interaction.SaveOperation.LOAD:
                var that = this;
                shuffler.progressHandler.GetSavedProgress(function (data) {
                    shuffler.playlistItemsCompleted = data.completed;
                    shuffler.playlistItemsQueued = data.queued;
                    Utils.Shuffle(shuffler.playlistItemsQueued);
                    shuffler.PlayNextVideo();
                });
                break;
            case Interaction.SaveOperation.DISCARD:
                shuffler.progressHandler.DiscardProgress();
                break;
            case Interaction.SaveOperation.IGNORE:
            default:
                break;
        }
    }
    OnAdvSettingsSubmit(data) {
        if (data.remember === "on") {
            Utils.SetCookie("APIKey", data.apiKey);
            Utils.SetCookie("ClientId", data.clientId);
        }
        shuffler.googleAPIHandler.setAPIKey(data.apiKey);
        shuffler.googleAPIHandler.setClientId(data.clientId);
        shuffler.googleAPIHandler.LoadAuthAPI();
        shuffler.googleAPIHandler.LoadYoutubeAPI();
    }
    PlayPlaylist(playlist, action) {
        let playlistId = Utils.GetQueryParams(playlist, "list") || playlist;
        if (this.playlistItemsQueued.length != 0 && action == Interaction.PlaylistPlayAction.NORMAL) {
            this.uiManager.ShowActivePlaylistOpModal();
            return;
        }
        var that = this;
        this.youtubeDataHandler.FetchPlaylistItems(playlistId, function (fetchedItems) {
            if (action === Interaction.PlaylistPlayAction.MERGE) {
                that.playlistItemsQueued.push(...fetchedItems);
            }
            else {
                that.playlistItemsQueued = fetchedItems;
                // reset completed array
                that.playlistItemsCompleted.length = 0;
            }
            Utils.Shuffle(that.playlistItemsQueued);
            if (action !== Interaction.PlaylistPlayAction.MERGE) {
                that.PlayNextVideo();
            }
            else {
                Utils.SetCurrentStatusMessage(`Playing: ${that.playlistItemsCompleted.length}/${that.playlistItemsCompleted.length + that.playlistItemsQueued.length}`, false);
            }
        });
    }
    PlayNextVideo() {
        let item = this.playlistItemsQueued.pop();
        if (!item) {
            console.log("Queued items depleted");
            return;
        }
        this.playlistItemsCompleted.push(item);
        Utils.SetCurrentStatusMessage(`Playing: ${this.playlistItemsCompleted.length}/${this.playlistItemsCompleted.length + this.playlistItemsQueued.length}`, false);
        if (item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId) {
            this.youtubePlayerHandler.PlayVideo(item.snippet.resourceId.videoId);
        }
        else {
            console.log(`ERROR: FAILED TO PLAY VIDEO, VideoId in "item.snippet.resourceId.videoId" is undefined or null. ${item}`);
        }
    }
    RepeatVideo() {
        let video = shuffler.playlistItemsCompleted.pop();
        if (video)
            shuffler.playlistItemsQueued.push(video);
    }
    onYoutubePlayerReady(event) {
        console.log("PLAYER READY;");
        event.target.playVideo();
    }
    onYoutubePlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            shuffler.PlayNextVideo();
        }
    }
}
