class YoutubeDataAPIHandler {
    constructor() {}

    public GetPlaylistDetails(playlistId: string, pageToken: string="", parts: string[]=["snippet"]):
            gapi.client.Request<gapi.client.youtube.PlaylistItemListResponse>
    {
        return gapi.client.youtube.playlistItems.list({
            "part": parts,
            "maxResults": 50,
            "pageToken": pageToken,
            "playlistId": playlistId
        });
    }

    public FetchPlaylistItems(playlistId: string, callback: Function, fetchedItems: gapi.client.youtube.PlaylistItem[]=[], pageId: (string | undefined)=undefined): void
    {
        // let fetchedItems: gapi.client.youtube.PlaylistItem[] = [];
        // let respPageId: (string | undefined);

        var that = this;
        this.GetPlaylistDetails(playlistId, pageId).then(
            function(resp)
            {
                pageId = resp.result.nextPageToken;
                if (!resp.result.items)
                {
                    console.log("No Items in the result set??");
                }
                else
                {
                    fetchedItems.push(...resp.result.items);
                }
                Utils.SetCurrentStatusMessage(`Fetching Playlist ${fetchedItems.length}/${resp.result.pageInfo?.totalResults}`, true);

                if (pageId)
                {
                    that.FetchPlaylistItems(playlistId, callback, fetchedItems, pageId);
                }
                else
                {
                    callback(fetchedItems);
                }
            },
            function(err)
            {
                console.error(`Error fetching playlist: ${err.result.error.message}`);
                toastr.error(`ERROR: ${err.result.error.message}`, "Playlist");
            }
        )
    }
}