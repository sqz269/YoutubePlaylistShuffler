class YoutubePlayerAPIHandler {
    player: (YT.Player | undefined);

    onPlayerStateChangeCallback: Function;
    onPlayerReadyCallback: Function;

    constructor(onPlayerStateChangeCallback: Function, onPlayerReadyCallback: Function)
    {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
        this.onPlayerReadyCallback = onPlayerReadyCallback;
    }

    public PlayVideo(videoId: string)
    {
        var that = this;
        if (this.player === undefined)
        {
            this.player = new YT.Player('player',
            {
                videoId: videoId,
                events: {
                    'onReady': function(event)
                    {
                        that.onPlayerReadyCallback(event);
                    },
                    'onStateChange': function(event)
                    {
                        that.onPlayerStateChangeCallback(event);
                    }
                }
            })
        }
        else
        {
            this.player.loadVideoById(videoId);
        }
    }

    public Init()
    {
        console.log("INITIZING PLAYER IFRAME")
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    }
}