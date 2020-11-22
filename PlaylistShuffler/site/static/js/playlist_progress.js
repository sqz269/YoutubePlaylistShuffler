function checkAndLoadProgress()
{
    let savedItems = JSON.parse(localStorage.getItem("savedItems"));
    if (savedItems !== null && savedItems.length > 0)
    {
        $("#playlistSavedAskOp").modal("show");
    }
}

function determineSaveProgressAction(action)
{
    console.log("Action: " + action)
    if (action === 'load')
    {
        loadProgress();
    }
    else if (action === 'discard')
    {
        discardSaveProgress();
    }
    else
    {
    }
}

function discardSaveProgress()
{
    localStorage.removeItem("saveMode");
    localStorage.removeItem("playlist");
    localStorage.removeItem("savedItems")
    toastr["warning"](`Playlist Progress Discarded`,"Progress")
}

function saveProgress()
{
    if (playlistItemsQueue.length === 0)
    {
        return;
    }
    localStorage.setItem("playlist", currentPlaylistId);
    var svData = undefined;
    if (playlistItemsCompleted.length > playlistItemsQueue.length)
    {
        // If there is more completed videos, then save the currently queued ones
        localStorage.setItem("savedMode", "queued");
        svData = playlistItemsQueue;
    }
    else
    {
        localStorage.setItem("saveMode", "completed");
        svData =  playlistItemsCompleted;
    }

    let playlistItems = [];

    svData.forEach(element => {
        playlistItems.push(element.snippet.position);
    });

    playlistItems.sort(function(a, b) {
        return a - b;
    });

    localStorage.setItem("savedItems", JSON.stringify(playlistItems))

    toastr["success"](`Playlist Progress Saved`,"Progress")
}

function loadProgress()
{
    function onPlaylistFetchCompleteLoadProgress(data)
    {
        let isSavedItemsTypeQueued = localStorage.getItem("saveMode") === "queued"
        let savedItems = JSON.parse(localStorage.getItem("savedItems"))
        if (isSavedItemsTypeQueued)
        {
            // move the fetched playlist from playlistItemQueue to playlistItemCompleted
            playlistItemsCompleted = playlistItemsQueue;
            playlistItemsQueue = []

            savedItems.forEach(itemPosition =>
            {
                playlistItemsCompleted.some(function(element, index)
                {
                    if (element.snippet.position === itemPosition)
                    {
                        console.log(`PUSHING ITEM: ${element} TO QUEUED ARRAY. REMOVING FROM COMPLETED ARRAY`)
                        playlistItemsQueue.push(element);
                        playlistItemsCompleted.splice(index, 1);
                        return false;
                    }
                });
            });
        }
        else
        {
            savedItems.forEach(itemPosition =>
            {
                playlistItemsQueue.some(function (element, index){
                    if (element.snippet.position === itemPosition)
                    {
                        console.log(`PUSHING ITEM: ${element} TO COMPLETED ARRAY. REMOVING FROM QUEUED ARRAY`)
                        playlistItemsCompleted.push(element);
                        playlistItemsQueue.splice(index, 1);
                        return false;
                    }
                })
            });
        }
        toastr["success"](`Playlist Progress Loaded`,"Progress")
        shuffle(playlistItemsQueue);
        playNextVideo();
    }

    if (localStorage.getItem("savedItems"))
    {
        fetchAllPlayListData(localStorage.getItem("playlist"), playlistItemsQueue, onPlaylistFetchCompleteLoadProgress);
    }
}
