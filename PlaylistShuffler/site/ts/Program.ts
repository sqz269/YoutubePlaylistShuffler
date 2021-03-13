let shuffler: YoutubePlaylistShuffler;

function main()
{
    let apiKey: (string | undefined) = Utils.getCookie("APIKey");
    let clientId: (string | undefined) = Utils.getCookie("ClientId");

    shuffler = new YoutubePlaylistShuffler(apiKey, clientId);
}

window.onload = function()
{
    gapi.load("client:auth2", main)
}