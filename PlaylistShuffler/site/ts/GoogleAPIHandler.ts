class GoogleAPIHandler 
{
    private apiKey: string;
    private clientId: string;

    isAuthAPIReady: boolean = false;
    isYoutubeDataAPIReady: boolean = false;

    auth: (gapi.auth2.GoogleAuth | undefined);

    constructor(apiKey: string="", clientId: string="") 
    {
        this.apiKey = apiKey;
        this.clientId = clientId;
    }

    public setAPIKey(key: string)
    {
        this.isYoutubeDataAPIReady = false;
        this.apiKey = key;
    }

    public setClientId(id: string)
    {
        this.isAuthAPIReady = false;
        this.clientId = id;
    }

    public LoadAuthAPI()
    {
        var that = this;
        gapi.auth2.init({client_id: this.clientId}).then(
            function(auth: gapi.auth2.GoogleAuth)
            {
                that.isAuthAPIReady = true;
                that.auth = auth;
            },
            function(reason)
            {
                that.isAuthAPIReady = false;
                toastr.warning(`ERROR: ${reason.details}`, "Auth API");
                console.error(`Failed to load Auth API: ${reason.details}`);
            }
        );
    }

    public Authorize()
    {
        if (!this.isAuthAPIReady || !this.auth)
        {
            console.error("Unable to open signin window, auth api not loaded. Call LoadAuthAPI before calling Authorize");

            toastr.warning("No Client Id Specificed, Authorize Will be disabled until a valid Client Id is supplied", "Auth");
            return;
        }

        var that = this;
        this.auth.signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"}).then
        (
            function()
            {
                that.isAuthAPIReady = true;
                toastr.success("Authorization Sucessful", "Sign-In");
            },
            function (reason: any)
            {
                that.isAuthAPIReady = false;
                toastr.error(`Error: ${reason.error}`, "Sign-In");
                console.error(`Error when Signing In, Reason: ${reason.error}`);
            }
        );
    }

    public LoadYoutubeAPI()
    {
        if (!this.apiKey)
        {
            console.log("No API Key Specificed");
            Utils.SetCurrentStatusMessage("ERROR: No API Key Specificed", false);
            toastr.error("Error: No API Key Specificed. Please Supply an API Key in Advanced Settings", "Initialize");
        }
        var that = this;
        gapi.client.setApiKey(this.apiKey);
        Utils.SetCurrentStatusMessage("Loading API", true);
        gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3").then
        (
            function()
            {
                that.isYoutubeDataAPIReady = true;
                Utils.SetCurrentStatusMessage("Ready", false);
                console.log("Youtube Data API Ready");
            },
            function (reason: any)
            {
                that.isYoutubeDataAPIReady = false;
                Utils.SetCurrentStatusMessage(`API ERROR: ${reason.error.message}`, false);
                toastr.error(`Failed to Load Youtube API. ${reason.error.message}`, "Youtube API");
                console.error(`Failed to load API, Reason: ${reason.error.message}`);
            }
        );
    }
}