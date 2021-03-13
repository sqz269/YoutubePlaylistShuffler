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
            toastr.warning("ERROR: \n" + reason.details, "Auth API");
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
            Utils.setCurrentStatusMessage("ERROR: No API Key Specificed", false);
            toastr.error("Error: No API Key Specificed. Please Supply an API Key in Advanced Settings", "Initialize");
        }
        var that = this;
        gapi.client.setApiKey(this.apiKey);
        Utils.setCurrentStatusMessage("Loading API", true);
        gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3").then(function () {
            that.isYoutubeDataAPIReady = true;
            Utils.setCurrentStatusMessage("Ready", false);
            console.log("Youtube Data API Ready");
        }, function (reason) {
            that.isYoutubeDataAPIReady = false;
            Utils.setCurrentStatusMessage("API ERROR: " + reason.error.message, false);
            toastr.error("Failed to Load Youtube API. " + reason.error.message, "Youtube API");
            console.error("Failed to load API, Reason: " + reason.error.message);
        });
    };
    return GoogleAPIHandler;
}());
var shuffler;
function main() {
    var apiKey = Utils.getCookie("APIKey");
    var clientId = Utils.getCookie("ClientId");
    shuffler = new YoutubePlaylistShuffler(apiKey, clientId);
}
window.onload = function () {
    gapi.load("client:auth2", main);
};
var YoutubePlaylistShuffler = /** @class */ (function () {
    function YoutubePlaylistShuffler(apiKey, clientId) {
        this.isYoutubePlayerReady = false;
        this.SetToastrOption();
        this.googleAPIHandler = new GoogleAPIHandler(apiKey, clientId);
        if (!apiKey) {
            console.log("WARNING: NO YOUTUBE DATA API KEY SPECIFIED");
        }
        else {
            this.googleAPIHandler.LoadYoutubeAPI();
        }
        if (!clientId) {
            console.log("WARNING: NO CLIENT ID SPECIFIED");
        }
        else {
            this.googleAPIHandler.LoadAuthAPI();
        }
        this.youtubePlayerHandler = new YoutubePlayerAPIHandler(this.onYoutubePlayerStateChange, this.onYoutubePlayerReady);
        this.youtubePlayerHandler.Init();
    }
    YoutubePlaylistShuffler.prototype.SetToastrOption = function () {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 3000;
        toastr.options.progressBar = true;
    };
    YoutubePlaylistShuffler.prototype.onYoutubePlayerReady = function (event) {
        console.log("PLAYER READY;");
        this.isYoutubePlayerReady = true;
    };
    YoutubePlaylistShuffler.prototype.onYoutubePlayerStateChange = function (event) {
        console.log("PLAYER STATE CHANGED");
    };
    return YoutubePlaylistShuffler;
}());
var UIManager = /** @class */ (function () {
    function UIManager() {
    }
    UIManager.prototype.AuthAPIReadyStateChanged = function (readyState) {
    };
    UIManager.prototype.YoutubeDataAPIReadyStateChanged = function (readyState) {
    };
    UIManager.GetInstance = function () {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    };
    return UIManager;
}());
var Utils;
(function (Utils) {
    function getQueryParams(qs, name) {
        try {
            var url = new URL(qs);
            return url.searchParams.get(name);
        }
        catch (e) {
            return null;
        }
    }
    Utils.getQueryParams = getQueryParams;
    function setCurrentStatusMessage(message, enableSpinner) {
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
    Utils.setCurrentStatusMessage = setCurrentStatusMessage;
    function getCookie(name) {
        var _a;
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2)
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
    }
    Utils.getCookie = getCookie;
    function setCookie(name, value) {
        document.cookie = name + "=" + value + "; expires=Fri, 31 Dec 2037 23:59:59 GMT";
    }
    Utils.setCookie = setCookie;
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    Utils.shuffle = shuffle;
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
    YoutubeDataAPIHandler.prototype.FetchPlaylistItems = function (playlistId, callback) {
        var fetchedItems = [];
        var respPageId;
        while (respPageId !== "") {
            this.GetPlaylistDetails(playlistId, respPageId).then(function (resp) {
                respPageId = resp.result.nextPageToken;
                if (!resp.result.items) {
                    console.log("No Items in the result set??");
                }
                else {
                    fetchedItems.push.apply(fetchedItems, resp.result.items);
                }
            }, function (err) {
                console.error("Error fetching playlist: " + err);
            });
        }
        callback(fetchedItems);
    };
    return YoutubeDataAPIHandler;
}());
var YoutubePlayerAPIHandler = /** @class */ (function () {
    function YoutubePlayerAPIHandler(onPlayerStateChangeCallback, onPlayerReadyCallback) {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
        this.onPlayerReadyCallback = onPlayerReadyCallback;
    }
    YoutubePlayerAPIHandler.prototype.onPlayerReady = function (event) {
        this.onPlayerReadyCallback(event);
    };
    YoutubePlayerAPIHandler.prototype.onPlayerStateChange = function (event) {
        this.onPlayerStateChangeCallback(event);
    };
    YoutubePlayerAPIHandler.prototype.PlayVideo = function (videoId) {
        if (this.player === undefined) {
            this.player = new YT.Player('player', {
                videoId: videoId,
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange
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
