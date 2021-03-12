let gapiHandler: GoogleAPIHandler;

function main()
{
    let apiKey: (string | undefined) = Utils.getCookie("APIKey");
    let clientId: (string | undefined) = Utils.getCookie("ClientId");

    gapiHandler = new GoogleAPIHandler(apiKey, clientId);
    gapiHandler.LoadAuthAPI();
    gapiHandler.LoadYoutubeAPI();

}

window.onload = function()
{
    main();
}