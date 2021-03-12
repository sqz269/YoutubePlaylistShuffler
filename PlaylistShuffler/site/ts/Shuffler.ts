class YoutubePlaylistShuffler
{
    googleAPIHandler: GoogleAPIHandler;
    youtubePlayerHandler: YoutubePlayerAPIHandler;

    isYoutubePlayerReady: boolean = false;

    constructor(apiKey: string, clientId: string)
    {
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
        this.youtubePlayerHandler.InitIframe();
    }

    private onYoutubePlayerReady(event: YT.PlayerEvent)
    {
        this.isYoutubePlayerReady = true;
    }

    private onYoutubePlayerStateChange(event: YT.PlayerEvent)
    {
        
    }
}