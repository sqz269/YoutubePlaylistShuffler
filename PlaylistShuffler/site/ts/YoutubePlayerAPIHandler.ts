class YoutubePlayerAPIHandler {
    player: (YT.Player | undefined);

    onPlayerStateChangeCallback: Function;
    onPlayerReadyCallback: Function;

    constructor(onPlayerStateChangeCallback: Function, onPlayerReadyCallback: Function)
    {
        this.onPlayerStateChangeCallback = onPlayerStateChangeCallback;
        this.onPlayerReadyCallback = onPlayerReadyCallback;
    }

    private onPlayerReady(event: YT.PlayerEvent)
    {
        this.onPlayerReadyCallback(event);
    }
    
    private onPlayerStateChange(event: YT.PlayerEvent)
    {
        this.onPlayerStateChangeCallback(event);
    }

    public PlayVideo(videoId: string)
    {
        if (this.player === undefined)
        {
            this.player = new YT.Player('player',
            {
                videoId: videoId,
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange
                }
            })
        }
        else
        {
            this.player.loadVideoById(videoId);
        }
    }

    public InitIframe()
    {
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    }
}