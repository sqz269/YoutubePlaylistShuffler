class UIManager
{
    private static _instance: UIManager;

    private constructor()
    {}

    public AuthAPIReadyStateChanged(readyState: boolean)
    {

    }

    public YoutubeDataAPIReadyStateChanged(readyState: boolean)
    {
        
    }

    public static GetInstance()
    {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}
