class GoogleAPIHandler 
{
    private apiKey: string;
    private clientId: string;

    isAuthAPIReady: boolean = false;
    isYoutubeDataAPIReady: boolean = false;

    constructor(apiKey: string="", clientId: string="") 
    {
        this.apiKey = apiKey;
        this.clientId = clientId;
    }

    public setAPIKey(key: string)
    {
        this.isYoutubeDataAPIReady = false;
    }

    public setClientId(id: string)
    {
        this.isAuthAPIReady = false;
    }

    private AuthAPILoadSuccess()
    {
        this.isAuthAPIReady = true;
    }

    private AuthAPILoadError(reason: any)
    {
        this.isAuthAPIReady = false;
    }

    private YoutubeAPILoadSuccess()
    {
        this.isYoutubeDataAPIReady = true;
    }

    private YoutubeAPILoadError(reason: any)
    {
        this.isYoutubeDataAPIReady = false;
    }

    public LoadAuthAPI()
    {
        gapi.auth2.init({client_id: this.clientId});
        gapi.auth2.getAuthInstance().signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"}).then
        (
            this.AuthAPILoadSuccess,
            this.AuthAPILoadError
        );
    }

    public LoadYoutubeAPI()
    {
        if (!this.apiKey)
        {
            console.log("No API Specificed");
        }

        gapi.client.setApiKey(this.apiKey);
        gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3").then
        (
            this.YoutubeAPILoadSuccess,
            this.YoutubeAPILoadError
        );
    }
}