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

    public FetchPlaylistItems(playlistId: string, callback: Function): void
    {
        let fetchedItems: gapi.client.youtube.PlaylistItem[] = [];
        let respPageId: (string | undefined);

        while (respPageId !== "")
        {
            this.GetPlaylistDetails(playlistId, respPageId).then(
                function(resp)
                {
                    respPageId = resp.result.nextPageToken;
                    if (!resp.result.items)
                    {
                        console.log("No Items in the result set??");
                    }
                    else
                    {
                        fetchedItems.push(...resp.result.items);
                    }
                },
                function(err)
                {
                    console.error(`Error fetching playlist: ${err}`)
                }
            )
        }

        callback(fetchedItems);
    }
}