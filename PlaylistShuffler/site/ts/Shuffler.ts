class YoutubePlaylistShuffler
{
    googleAPIHandler: GoogleAPIHandler;
    youtubePlayerHandler: YoutubePlayerAPIHandler;

    isYoutubePlayerReady: boolean = false;

    constructor(apiKey?: string, clientId?: string)
    {
        this.SetToastrOption();

        this.googleAPIHandler = new GoogleAPIHandler(apiKey, clientId);
        if (!apiKey)
        {
            console.log("WARNING: NO YOUTUBE DATA API KEY SPECIFIED");
        }
        else
        {
            this.googleAPIHandler.LoadYoutubeAPI();
        }

        if (!clientId)
        {
            console.log("WARNING: NO CLIENT ID SPECIFIED");
        }
        else
        {
            this.googleAPIHandler.LoadAuthAPI();
        }

        this.youtubePlayerHandler = new YoutubePlayerAPIHandler(this.onYoutubePlayerStateChange, this.onYoutubePlayerReady)
        this.youtubePlayerHandler.Init();
    }

    public SetToastrOption()
    {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 3000;
        toastr.options.progressBar = true;
    }

    private onYoutubePlayerReady(event: YT.PlayerEvent)
    {
        console.log("PLAYER READY;");
        this.isYoutubePlayerReady = true;
        event.target.playVideo();
    }

    private onYoutubePlayerStateChange(event: YT.PlayerEvent)
    {
        console.log("PLAYER STATE CHANGED");
    }
}