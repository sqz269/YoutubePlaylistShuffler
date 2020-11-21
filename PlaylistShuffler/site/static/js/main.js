function getPlaylistIdFromInput()
{
    let element = document.getElementById("playlist-input");
    let playlistId = getQueryParams(element.value, "list");
    if (playlistId === null || playlistId === undefined)
    {
        return element.value;
    }
    return playlistId;
}

var playlistItemsCompleted = []
var playlistItemsQueue = []
var player = undefined;

/**
 *
 * @param merge {boolean}
 */
function playPlaylist(merge=undefined)
{
    console.log("Merge? ", merge);
    let playlistId = getPlaylistIdFromInput();

    if (merge === undefined && playlistItemsQueue.length)
    {
        $("#playlistExistOp").modal("show");
        return ;
    }

    if (merge === false)
    {
        console.log("Resetting Queue and Completed Array")
        playlistItemsQueue.length = 0
        playlistItemsCompleted.length = 0
    }

    fetchAllPlayListData(playlistId, playlistItemsQueue, onAllPlaylistDataFetched);

    /**
     *
     * @param data {Object[]}
     */
    function onAllPlaylistDataFetched(data)
    {
        console.log("Shuffling playlist");
        setCurrentStatusMessage("Shuffling Playlist", true);
        shuffle(data);
        setCurrentStatusMessage("Waiting for player", true);
        playNextVideo();
    }
}

function playNextVideo()
{
    let video = playlistItemsQueue.pop();
    playlistItemsCompleted.push(video);
    let videoId = video.snippet.resourceId.videoId;
    let videoThumbnail = video.snippet.thumbnails.default.url;
    let videoTitle = video.snippet.title;

    setCurrentStatusMessage(`Playing ${playlistItemsCompleted.length}/${playlistItemsQueue.length + playlistItemsCompleted.length}`, false);

    document.title = videoTitle;
    $("#video-title").text(videoTitle);
    playVideo(videoId);
}

function repeatThisVideo()
{
    let video = playlistItemsCompleted.pop();
    playlistItemsQueue.push(video);
}
