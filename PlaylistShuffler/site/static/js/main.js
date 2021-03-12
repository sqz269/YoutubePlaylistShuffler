"use strict";
var GoogleAPIHandler = /** @class */ (function () {
    function GoogleAPIHandler(apiKey, clientId) {
        if (apiKey === void 0) { apiKey = ""; }
        if (clientId === void 0) { clientId = ""; }
        this.apiKey = apiKey;
        this.clientId = clientId;
    }
    GoogleAPIHandler.prototype.loadAuthAPI = function () {
        gapi.auth2.init({ client_id: this.clientId });
        gapi.auth2.getAuthInstance().signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" }).then(function () {
            console.log("Sign-in suggessfull");
        }, function (err) {
            console.log("Error Signing in: " + err);
        });
    };
    GoogleAPIHandler.prototype.loadYoutubeAPI = function () {
        if (!this.apiKey) {
            console.log("No API Specificed");
        }
        gapi.client.setApiKey(this.apiKey);
        gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3").then(function () {
            console.log("Ready");
        }, function (err) {
            console.log("Error: " + err);
        });
    };
    return GoogleAPIHandler;
}());
var YoutubeAPIHandler = /** @class */ (function () {
    function YoutubeAPIHandler() {
    }
    YoutubeAPIHandler.prototype.GetPlaylistDetails = function (playlistId, pageToken, parts) {
        if (pageToken === void 0) { pageToken = ""; }
        if (parts === void 0) { parts = ["snippet"]; }
        return gapi.client.youtube.playlistItems.list({
            "part": parts,
            "maxResults": 50,
            "pageToken": pageToken,
            "playlistId": playlistId
        });
    };
    YoutubeAPIHandler.prototype.FetchPlaylistItems = function (playlistId, callback) {
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
    return YoutubeAPIHandler;
}());
var YoutubePlayerAPIHandler = /** @class */ (function () {
    function YoutubePlayerAPIHandler(onPlayerStateChangeCallback) {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
    }
    YoutubePlayerAPIHandler.prototype.onPlayerReady = function (event) {
        event.target.playVideo();
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
    YoutubePlayerAPIHandler.prototype.InitIframe = function () {
    };
    return YoutubePlayerAPIHandler;
}());
