function authorize()
{
    try
    {
         return gapi.auth2.getAuthInstance()
            .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
            .then(function ()
                {
                    toastr["success"]("Sign-in successful");
                },
                function (err)
                {
                    toastr["error"](`${err["error"]}`, "Error singing in");
                });
    } catch (e)
    {
        setToastrOptions(undefined, "10000");
        toastr["error"](`No Client ID Present<br>Enter a Client ID in Advanced Settings before continuing`,
            "Authorization Failed");
        setToastrOptions(); // Reset to default values
    }
}

/**
 * Load client
 * @param apiKey {string} Youtube Data API v3 key
 * @returns {Promise<void>}
 */
function loadClient(apiKey)
{
    if (!apiKey)
    {
        setToastrOptions(undefined, "10000");
        toastr["error"](`No API Key Specified.<br>Please enter your API Key in Advanced Settings`,
            "Failed to load GAPI");
        setToastrOptions(); // Reset to default values
        setCurrentStatusMessage(`ERROR: API Key Not Present`, false);
        return;
    }
    gapi.client.setApiKey(apiKey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function ()
            {
                setCurrentStatusMessage("Ready", false);
            },
            function (err)
            {
                setToastrOptions(undefined, "15000");
                toastr["error"](`${err["error"]["message"]}.<br>Potential solution: Reconfigure API Key in Advanced Settings`,
                    "Failed to load GAPI");
                setToastrOptions(); // Reset to default values
                setCurrentStatusMessage(`ERROR: ${err["error"]["message"]}`, false);
            });
}

$("#apiConfig").on("submit", function (e)
{
    e.preventDefault();
    console.log("Reconfiguring API Data");

    let clientId = $("#clientIdInput").val();
    let apiKey = $("#apiKeyInput").val();

    if ($('#rememberThis').is(":checked"))
    {
        setCookie("apiKey", apiKey);
        setCookie("clientId", clientId);
    }

    setCurrentStatusMessage("Reauthenticating API", true);

    loadClient(apiKey);
    loadAuthKey(clientId);
})

/**
 * Get list of items from playlist
 * @param playlistId {string} The playlistId parameter specifies the unique ID of the playlist for which you want to retrieve playlist items.
 * @param pgToken {string} The pageToken parameter identifies a specific page in the result set that should be returned.
 * @param parts {string[]} The part parameter specifies a comma-separated list of one or more playlistItem resource properties that the API response will include.
 * @return {Promise}
 */
function getPlayListDetails(playlistId, pgToken="", parts = ["snippet"])
{
    return gapi.client.youtube.playlistItems.list({
        "part": parts,
        "maxResults": 50,
        "pageToken": pgToken,
        "playlistId": playlistId
    });
}

/**
 * fetch all video from a playlist
 * @param playlistId {string}
 * @param playlistItems {Object[]}
 * @param callback {function}
 * @param pageId {string}
 */
function fetchAllPlayListData(playlistId, playlistItems, callback, pageId="")
{
    currentPlaylistId = playlistId;
    getPlayListDetails(playlistId, pageId)
        .then(function (response)
        {
            playlistItems.push(...response["result"]["items"]);
            pageId = response.result.nextPageToken || "";
            if (pageId)
            {
                setCurrentStatusMessage(`Fetching playlist items: ${playlistItems.length}/${response["result"]["pageInfo"]["totalResults"]}`, true);
                fetchAllPlayListData(playlistId, playlistItems, callback, pageId);
            }
            else
            {
                setCurrentStatusMessage(`Fetched total of ${playlistItems.length} items`)
                callback(playlistItems);
            }
        },
        function (err)
        {
            console.error("Error fetching play list: ", err);
            toastr["error"](`${err["result"]["error"]["message"]}`, "Error fetching playlist");
        });
}

function loadAuthKey(client_id)
{
    if (!client_id)
    {
        setToastrOptions(undefined, "15000");
        toastr["warning"](`No Client Id specified<br>Please enter your Client Id in Advanced Settings before using Authorization`,
            "Authorization");
        setToastrOptions(); // Reset to default values
        return ;
    }
    gapi.auth2.init({client_id: client_id});
}

function setAdvancedSettingsInputFields()
{
    $("#clientIdInput").val(getCookie("clientId"));
    $("#apiKeyInput").val(getCookie("apiKey"));
}

window.addEventListener('load', function () {
    gapi.load("client:auth2", function ()
    {
        loadClient(getCookie("apiKey"));
        loadAuthKey(getCookie("clientId"));
        setAdvancedSettingsInputFields();  // Set API Key and Client ID in the Input field
    })
});
