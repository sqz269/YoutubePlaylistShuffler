enum SaveType
{
    Queued,
    Completed
}

interface SavedProgress
{
    type: SaveType,
    // The number[] represents the list of video at position that is either completed or queued depending on the SaveType
    data: { [playlistId: string]: number[] }
}

interface FetchedItems
{
    playlistId: string,
    items: gapi.client.youtube.PlaylistItem[]
}

class ProgressHandler {
    youtubeDataAPI: YoutubeDataAPIHandler;
    
    constructor() 
    {
        this.youtubeDataAPI = new YoutubeDataAPIHandler();
    }

    public GetSavedProgress(callback: (data: {completed : gapi.client.youtube.PlaylistItem[], 
                                               queued: gapi.client.youtube.PlaylistItem[]}) => any)
    {
        let savedProgress: string | null = localStorage.getItem("savedProgress");
        if (!savedProgress)
        {
            return null;
        }
        let saved: SavedProgress = JSON.parse(savedProgress);

        var fetchedItems: FetchedItems[] = [];

        var fetchTargets = Object.keys(saved.data);
        var fetchIteration = 0;
        var targetIteration = fetchTargets.length;
        var that = this;

        function ProcessFetchedItems()
        {
            var playlistCompleted: gapi.client.youtube.PlaylistItem[] = [];
            var playlistQueued: gapi.client.youtube.PlaylistItem[] = [];
            // Completed means the SaveData.itmes stores list of video positions that has been played
            
            fetchedItems.forEach(element => 
            {
                // Performace increase? Maybe
                let items: Set<number> = new Set(saved.data[element.playlistId]);
    
                element.items.forEach(e =>
                {
                    // Short Circuit Evaulation
                    if (e.snippet && e.snippet.position && items.has(e.snippet.position))
                    {
                        let _ = saved.type === SaveType.Completed ? playlistCompleted.push(e) : playlistQueued.push(e);
                    }
                    else
                    {
                        let _ = saved.type === SaveType.Completed ? playlistQueued.push(e) : playlistCompleted.push(e);
                    }
                });
            });
            callback({"completed": playlistCompleted, "queued": playlistQueued});
        }

        // Because saved.data stores value in {playlistId: positions[]}, element is alreay playlistId
        function FetchItems()
        {
            let target = fetchTargets[fetchIteration];
            that.youtubeDataAPI.FetchPlaylistItems(target, function(data: gapi.client.youtube.PlaylistItem[])
            {
                var item: FetchedItems = {
                    "playlistId": target,
                    "items": data
                };
                fetchedItems.push(item);
                fetchIteration++;
                if (fetchIteration === targetIteration)
                {
                    ProcessFetchedItems();
                }
                else
                {
                    FetchItems();
                }
            });
        }

        FetchItems();
    }

    public SaveProgrss(playlistCompleted: gapi.client.youtube.PlaylistItem[],
                        playlistQueued: gapi.client.youtube.PlaylistItem[])
    {
        let saveType: SaveType = playlistCompleted.length < playlistQueued.length ? SaveType.Completed : SaveType.Queued;
        
        let data: { [playlistId: string]: number[] } = {};

        let saveList = saveType === SaveType.Completed ? playlistCompleted : playlistQueued;

        saveList.forEach(element =>
        {
            if (element?.snippet?.playlistId && element?.snippet?.position)
            {
                let playlistId = element.snippet.playlistId;
                let videoPosition = element.snippet.position;

                if (data[playlistId] === undefined)
                {
                    data[playlistId] = [videoPosition];
                }
                else
                {
                    data[playlistId].push(videoPosition);
                }
            }
        });

        let saveData: SavedProgress = {
            "type": saveType,
            "data": data
        }

        localStorage.setItem("savedProgress", JSON.stringify(saveData));
    }

    public DiscardProgress()
    {
        var discard = true;
        // Make copy of object that is not a reference;
        let option = Object.create(toastr.options);
        var that = this;
        option.onclick = function()
        {
            discard = false;
            toastr.info("Discard Aborted", "Progress");
        }
        option.onHidden = function()
        {
            if (discard)
            {
                that.DiscardProgressActual();
                toastr.error("Saved playlist Discarded", "Progress");
            }
        }
        toastr.warning("Saved Progress will be discarded in 10 seconds. <br>Click here to cancel", "Progress", option);
    }

    public DiscardProgressActual()
    {
        localStorage.removeItem("savedProgress");
    }
}