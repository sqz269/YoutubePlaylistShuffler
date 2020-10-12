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

function playPlaylist()
{
    let playlistId = getPlaylistIdFromInput();

    playlistItems = []
    playlistItemsCompleted = []

    fetchAllPlayListData(playlistId, playlistItemsQueue, onAllPlaylistDataFetched);

    /**
     *
     * @param data {Object[]}
     */
    function onAllPlaylistDataFetched(data)
    {
        setCurrentStatusMessage("Shuffling Playlist", true);
        shuffle(data);
        setCurrentStatusMessage("Waiting for player", true);
        playNextVideo();
    }
}

function playNextVideo()
{
    setCurrentStatusMessage("Playing");
    let video = playlistItemsQueue.pop();
    playlistItemsCompleted.push(video);
    let videoId = video.snippet.resourceId.videoId;
    let videoThumbnail = video.snippet.thumbnails.default.url;
    let videoTitle = video.snippet.title;

    document.title = videoTitle;
    playVideo(videoId);
}
