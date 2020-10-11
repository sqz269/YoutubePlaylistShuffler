function onYouTubeIframeAPIReady()
{
}

function playVideo(videoId)
{
    if (player === undefined)
    {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    else
    {
        player.loadVideoById(videoId);
    }
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event)
{
    event.target.playVideo();
}

function onPlayerStateChange(event)
{
    if (event.data == 0)
    {
        playNextVideo();
    }
}

window.addEventListener('load', function () {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
