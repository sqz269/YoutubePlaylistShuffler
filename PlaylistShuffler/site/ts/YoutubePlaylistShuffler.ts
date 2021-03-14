
class YoutubePlaylistShuffler
{
    googleAPIHandler: GoogleAPIHandler;
    youtubePlayerHandler: YoutubePlayerAPIHandler;
    youtubeDataHandler: YoutubeDataAPIHandler;
    progressHandler: ProgressHandler;
    uiManager: UIManager;

    playlistItemsQueued: gapi.client.youtube.PlaylistItem[] = [];
    playlistItemsCompleted: gapi.client.youtube.PlaylistItem[] = [];

    constructor(apiKey?: string, clientId?: string)
    {
        this.uiManager = new UIManager(this.OnPlaylistPlay, this.OnVideoAction, this.OnSaveOperation);
        this.uiManager.BindElements();

        this.googleAPIHandler = new GoogleAPIHandler(apiKey, clientId);
        this.googleAPIHandler.LoadYoutubeAPI();
        this.googleAPIHandler.LoadAuthAPI();

        this.youtubeDataHandler = new YoutubeDataAPIHandler();

        this.youtubePlayerHandler = new YoutubePlayerAPIHandler(this.onYoutubePlayerStateChange, this.onYoutubePlayerReady)
        this.youtubePlayerHandler.Init();

        this.progressHandler = new ProgressHandler();
    }

    private OnPlaylistPlay(type: Interaction.PlaylistPlayAction, data: any)
    {
        shuffler.PlayPlaylist(data, type);
    }

    private OnVideoAction(type: Interaction.VideoOperation, data: any)
    {
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

    private OnSaveOperation(type: Interaction.SaveOperation, data: any)
    {
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
    }

    private PlayPlaylist(playlist: string, action: Interaction.PlaylistPlayAction)
    {
        let playlistId = Utils.GetQueryParams(playlist, "list") || playlist;
        if (this.playlistItemsQueued.length != 0 && action == Interaction.PlaylistPlayAction.NORMAL)
        {
            this.uiManager.ShowActivePlaylistOpModal();
            return;
        }

        var that = this;
        this.youtubeDataHandler.FetchPlaylistItems(playlistId, function(fetchedItems: gapi.client.youtube.PlaylistItem[])
        {
            if (action === Interaction.PlaylistPlayAction.MERGE)
            {
                that.playlistItemsQueued.push(...fetchedItems);
            }
            else
            {
                that.playlistItemsQueued = fetchedItems;
                // reset completed array
                that.playlistItemsCompleted.length = 0;
            }

            Utils.Shuffle(that.playlistItemsQueued);
            that.PlayNextVideo();
        });
    }

    public PlayNextVideo()
    {
        let item = this.playlistItemsQueued.pop();
        if (!item)
        {
            console.log("Queued items depleted");
            return;
        }
        this.playlistItemsCompleted.push(item);
        
        Utils.SetCurrentStatusMessage(`Playing: ${this.playlistItemsCompleted.length}/${this.playlistItemsCompleted.length + this.playlistItemsQueued.length}`, false);

        if (item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId)
        {
            this.youtubePlayerHandler.PlayVideo(item.snippet.resourceId.videoId);
        }    
        else
        {
            console.log(`ERROR: FAILED TO PLAY VIDEO, VideoId in "item.snippet.resourceId.videoId" is undefined or null. ${item}`);
        }
    }

    public RepeatVideo()
    {
        let video = shuffler.playlistItemsCompleted.pop();
        if (video)
            shuffler.playlistItemsQueued.push(video);
    }

    private onYoutubePlayerReady(event: YT.PlayerEvent)
    {
        console.log("PLAYER READY;");
        event.target.playVideo();
    }

    private onYoutubePlayerStateChange(event: YT.OnStateChangeEvent)
    {
        if (event.data === YT.PlayerState.ENDED)
        {
            shuffler.PlayNextVideo();
        }
    }
}