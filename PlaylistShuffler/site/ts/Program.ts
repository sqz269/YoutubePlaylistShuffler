let shuffler: YoutubePlaylistShuffler;

function main()
{
    let apiKey: (string | undefined) = Utils.GetCookie("APIKey");
    let clientId: (string | undefined) = Utils.GetCookie("ClientId");

    shuffler = new YoutubePlaylistShuffler(apiKey, clientId);
}

window.onload = function()
{
    gapi.load("client:auth2", main)
}
