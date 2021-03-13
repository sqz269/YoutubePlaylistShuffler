"use strict";
var GoogleAPIHandler = /** @class */ (function () {
    function GoogleAPIHandler(apiKey, clientId) {
        if (apiKey === void 0) { apiKey = ""; }
        if (clientId === void 0) { clientId = ""; }
        this.isAuthAPIReady = false;
        this.isYoutubeDataAPIReady = false;
        this.apiKey = apiKey;
        this.clientId = clientId;
    }
    GoogleAPIHandler.prototype.setAPIKey = function (key) {
        this.isYoutubeDataAPIReady = false;
        this.apiKey = key;
    };
    GoogleAPIHandler.prototype.setClientId = function (id) {
        this.isAuthAPIReady = false;
        this.clientId = id;
    };
    GoogleAPIHandler.prototype.LoadAuthAPI = function () {
        var that = this;
        gapi.auth2.init({ client_id: this.clientId }).then(function (auth) {
            that.isAuthAPIReady = true;
            that.auth = auth;
        }, function (reason) {
            that.isAuthAPIReady = false;
            toastr.warning("ERROR: " + reason.details, "Auth API");
            console.error("Failed to load Auth API: " + reason.details);
        });
    };
    GoogleAPIHandler.prototype.Authorize = function () {
        if (!this.isAuthAPIReady || !this.auth) {
            console.error("Unable to open signin window, auth api not loaded. Call LoadAuthAPI before calling Authorize");
            toastr.warning("Warning: No Client Id Specificed, Authorize (Playing Private Playlist) Will be disabled until a valid Client Id is supplied", "Initialize");
            return;
        }
        var that = this;
        this.auth.signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" }).then(function () {
            that.isAuthAPIReady = true;
            toastr.success("Authorization Sucessful", "Sign-In");
        }, function (reason) {
            that.isAuthAPIReady = false;
            toastr.error("Error: " + reason.error, "Sign-In");
            console.error("Error when Signing In, Reason: " + reason.error);
        });
    };
    GoogleAPIHandler.prototype.LoadYoutubeAPI = function () {
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
            Utils.SetCurrentStatusMessage("API ERROR: " + reason.error.message, false);
            toastr.error("Failed to Load Youtube API. " + reason.error.message, "Youtube API");
            console.error("Failed to load API, Reason: " + reason.error.message);
        });
    };
    return GoogleAPIHandler;
}());
var shuffler;
function main() {
    var apiKey = Utils.GetCookie("APIKey");
    var clientId = Utils.GetCookie("ClientId");
    shuffler = new YoutubePlaylistShuffler(apiKey, clientId);
}
window.onload = function () {
    gapi.load("client:auth2", main);
};
var ProgressHandler = /** @class */ (function () {
    function ProgressHandler() {
    }
    ProgressHandler.prototype.GetSavedProgress = function () {
    };
    ProgressHandler.prototype.SaveProgrss = function () {
    };
    return ProgressHandler;
}());
var Interaction;
(function (Interaction) {
    var PlaylistPlayAction;
    (function (PlaylistPlayAction) {
        PlaylistPlayAction[PlaylistPlayAction["NORMAL"] = 0] = "NORMAL";
        PlaylistPlayAction[PlaylistPlayAction["MERGE"] = 1] = "MERGE";
        PlaylistPlayAction[PlaylistPlayAction["REPLACE"] = 2] = "REPLACE";
    })(PlaylistPlayAction = Interaction.PlaylistPlayAction || (Interaction.PlaylistPlayAction = {}));
    var VideoOperation;
    (function (VideoOperation) {
        VideoOperation[VideoOperation["NEXT"] = 0] = "NEXT";
        VideoOperation[VideoOperation["REPEAT"] = 1] = "REPEAT";
    })(VideoOperation = Interaction.VideoOperation || (Interaction.VideoOperation = {}));
    var SaveOperation;
    (function (SaveOperation) {
        SaveOperation[SaveOperation["SAVE"] = 0] = "SAVE";
        SaveOperation[SaveOperation["DISCARD"] = 1] = "DISCARD";
        SaveOperation[SaveOperation["IGNORE"] = 2] = "IGNORE";
        SaveOperation[SaveOperation["LOAD"] = 3] = "LOAD";
    })(SaveOperation = Interaction.SaveOperation || (Interaction.SaveOperation = {}));
})(Interaction || (Interaction = {}));
var UIManager = /** @class */ (function () {
    function UIManager(onPlaylistAction, onVideoAction, onSaveAction) {
        this.onPlaylistAction = onPlaylistAction;
        this.onVideoAction = onVideoAction;
        this.onSaveAction = onSaveAction;
        this.SetToastrOption();
    }
    UIManager.prototype.SetToastrOption = function () {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 3000;
        toastr.options.progressBar = true;
    };
    UIManager.prototype.BindElements = function () {
        this.BindPlaylistOpElements();
        this.BindSaveOpElements();
        this.BindVideoOpElements();
    };
    UIManager.prototype.BindPlaylistOpElements = function () {
        var that = this;
        $("#play-playlist").on("click", function (event) {
            var data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.NORMAL, data);
        });
        $("#playlist-op-replace").on("click", function (event) {
            var data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.REPLACE, data);
        });
        $("#playlist-op-merge").on("click", function (event) {
            var data = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.MERGE, data);
        });
    };
    UIManager.prototype.BindVideoOpElements = function () {
        var that = this;
        $("#video-repeat").on("click", function (event) {
            that.onVideoAction(Interaction.VideoOperation.REPEAT, undefined);
        });
        $("#video-next").on("click", function (event) {
            that.onVideoAction(Interaction.VideoOperation.NEXT, undefined);
        });
    };
    UIManager.prototype.BindSaveOpElements = function () {
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
    };
    UIManager.prototype.ShowActivePlaylistOpModal = function () {
        $("#playlistExistOp").show();
    };
    return UIManager;
}());
var Utils;
(function (Utils) {
    function GetQueryParams(qs, name) {
        try {
            var url = new URL(qs);
            return url.searchParams.get(name);
        }
        catch (e) {
            return null;
        }
    }
    Utils.GetQueryParams = GetQueryParams;
    function SetCurrentStatusMessage(message, enableSpinner) {
        document.getElementById("status-message").innerText = message;
        var spinElement = $("#status-spin");
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
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2)
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
    }
    Utils.GetCookie = GetCookie;
    function SetCookie(name, value) {
        document.cookie = name + "=" + value + "; expires=Fri, 31 Dec 2037 23:59:59 GMT";
    }
    Utils.SetCookie = SetCookie;
    function Shuffle(arr) {
        var i = arr.length, j, temp;
        while (--i > 0) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
    }
    Utils.Shuffle = Shuffle;
})(Utils || (Utils = {}));
var YoutubeDataAPIHandler = /** @class */ (function () {
    function YoutubeDataAPIHandler() {
    }
    YoutubeDataAPIHandler.prototype.GetPlaylistDetails = function (playlistId, pageToken, parts) {
        if (pageToken === void 0) { pageToken = ""; }
        if (parts === void 0) { parts = ["snippet"]; }
        return gapi.client.youtube.playlistItems.list({
            "part": parts,
            "maxResults": 50,
            "pageToken": pageToken,
            "playlistId": playlistId
        });
    };
    YoutubeDataAPIHandler.prototype.FetchPlaylistItems = function (playlistId, callback, fetchedItems, pageId) {
        // let fetchedItems: gapi.client.youtube.PlaylistItem[] = [];
        // let respPageId: (string | undefined);
        if (fetchedItems === void 0) { fetchedItems = []; }
        if (pageId === void 0) { pageId = undefined; }
        var that = this;
        this.GetPlaylistDetails(playlistId, pageId).then(function (resp) {
            var _a, _b;
            pageId = resp.result.nextPageToken;
            if (!resp.result.items) {
                console.log("No Items in the result set??");
            }
            else {
                fetchedItems.push.apply(fetchedItems, resp.result.items);
            }
            console.log("Fetching Playlist " + fetchedItems.length + "/" + ((_a = resp.result.pageInfo) === null || _a === void 0 ? void 0 : _a.totalResults));
            Utils.SetCurrentStatusMessage("Fetching Playlist " + fetchedItems.length + "/" + ((_b = resp.result.pageInfo) === null || _b === void 0 ? void 0 : _b.totalResults), true);
            if (pageId) {
                that.FetchPlaylistItems(playlistId, callback, fetchedItems, pageId);
            }
            else {
                callback(fetchedItems);
            }
        }, function (err) {
            console.error("Error fetching playlist: " + err.result.error.message);
            toastr.error("ERROR: " + err.result.error.message, "Playlist");
        });
    };
    return YoutubeDataAPIHandler;
}());
var YoutubePlayerAPIHandler = /** @class */ (function () {
    function YoutubePlayerAPIHandler(onPlayerStateChangeCallback, onPlayerReadyCallback) {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
        this.onPlayerReadyCallback = onPlayerReadyCallback;
    }
    YoutubePlayerAPIHandler.prototype.PlayVideo = function (videoId) {
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
    };
    YoutubePlayerAPIHandler.prototype.Init = function () {
        console.log("INITIZING PLAYER IFRAME");
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };
    return YoutubePlayerAPIHandler;
}());
var YoutubePlaylistShuffler = /** @class */ (function () {
    function YoutubePlaylistShuffler(apiKey, clientId) {
        this.playlistItemsQueued = [];
        this.playlistItemsCompleted = [];
        this.uiManager = new UIManager(this.OnPlaylistPlay, this.OnVideoAction, this.OnSaveOperation);
        this.uiManager.BindElements();
        this.googleAPIHandler = new GoogleAPIHandler(apiKey, clientId);
        this.googleAPIHandler.LoadYoutubeAPI();
        this.googleAPIHandler.LoadAuthAPI();
        this.youtubeDataHandler = new YoutubeDataAPIHandler();
        this.youtubePlayerHandler = new YoutubePlayerAPIHandler(this.onYoutubePlayerStateChange, this.onYoutubePlayerReady);
        this.youtubePlayerHandler.Init();
        this.progressHandler = new ProgressHandler();
    }
    YoutubePlaylistShuffler.prototype.OnPlaylistPlay = function (type, data) {
        shuffler.PlayPlaylist(data, type);
    };
    YoutubePlaylistShuffler.prototype.OnVideoAction = function (type, data) {
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
    };
    YoutubePlaylistShuffler.prototype.OnSaveOperation = function (type, data) {
        switch (type) {
            case Interaction.SaveOperation.SAVE:
                break;
            case Interaction.SaveOperation.LOAD:
                break;
            case Interaction.SaveOperation.DISCARD:
                break;
            case Interaction.SaveOperation.IGNORE:
            default:
                break;
        }
    };
    YoutubePlaylistShuffler.prototype.PlayPlaylist = function (playlist, action) {
        var playlistId = Utils.GetQueryParams(playlist, "list") || playlist;
        if (this.playlistItemsQueued.length != 0 && action == Interaction.PlaylistPlayAction.NORMAL) {
            this.uiManager.ShowActivePlaylistOpModal();
            return;
        }
        var that = this;
        this.youtubeDataHandler.FetchPlaylistItems(playlistId, function (fetchedItems) {
            var _a;
            if (action === Interaction.PlaylistPlayAction.MERGE) {
                (_a = that.playlistItemsQueued).push.apply(_a, fetchedItems);
            }
            else {
                that.playlistItemsQueued = fetchedItems;
                // reset completed array
                that.playlistItemsCompleted.length = 0;
            }
            Utils.Shuffle(that.playlistItemsQueued);
            that.PlayNextVideo();
        });
    };
    YoutubePlaylistShuffler.prototype.PlayNextVideo = function () {
        var item = this.playlistItemsQueued.pop();
        if (!item) {
            console.log("Queued items depleted");
            return;
        }
        this.playlistItemsCompleted.push(item);
        Utils.SetCurrentStatusMessage("Playing: " + this.playlistItemsCompleted.length + "/" + (this.playlistItemsCompleted.length + this.playlistItemsQueued.length), false);
        if (item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId) {
            this.youtubePlayerHandler.PlayVideo(item.snippet.resourceId.videoId);
        }
        else {
            console.log("ERROR: FAILED TO PLAY VIDEO, VideoId in \"item.snippet.resourceId.videoId\" is undefined or null. " + item);
        }
    };
    YoutubePlaylistShuffler.prototype.RepeatVideo = function () {
    };
    YoutubePlaylistShuffler.prototype.onYoutubePlayerReady = function (event) {
        console.log("PLAYER READY;");
        event.target.playVideo();
    };
    YoutubePlaylistShuffler.prototype.onYoutubePlayerStateChange = function (event) {
        console.log("PLAYER STATE CHANGED");
    };
    return YoutubePlaylistShuffler;
}());
