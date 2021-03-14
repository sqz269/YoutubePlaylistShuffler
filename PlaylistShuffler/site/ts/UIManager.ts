module Interaction
{
    export enum PlaylistPlayAction
    {
        NORMAL,
        MERGE,
        REPLACE
    }
    
    export enum VideoOperation
    {
        NEXT,
        REPEAT
    }
    
    export enum SaveOperation
    {
        SAVE,
        DISCARD,
        IGNORE,
        LOAD
    }
}

class UIManager
{
    onPlaylistAction: ((type: Interaction.PlaylistPlayAction, data: any) => any);

    onVideoAction: ((type: Interaction.VideoOperation, data: any) => any);

    onSaveAction: ((type: Interaction.SaveOperation, data: any) => any);

    onAdvFormSubmit: ((data: {[key: string]: string}) => any);

    advSettingsForm = $("#apiConfig");

    constructor(onPlaylistAction: (type: Interaction.PlaylistPlayAction, data: any) => any, 
                onVideoAction: (type: Interaction.VideoOperation, data: any) => any, 
                onSaveAction: (type: Interaction.SaveOperation, data: any) => any,
                onAdvFormSubmit: (data: {[key: string]: string}) => any)
    {
        this.onPlaylistAction = onPlaylistAction;
        this.onVideoAction = onVideoAction;
        this.onSaveAction = onSaveAction;
        this.onAdvFormSubmit = onAdvFormSubmit;

        this.SetToastrOption();
    }

    public SetToastrOption()
    {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 2000;
        toastr.options.progressBar = true;
    }

    public BindElements()
    {
        this.BindPlaylistOpElements();
        this.BindSaveOpElements();
        this.BindVideoOpElements();
    }

    public SetAdvancedSettingModalData(apiKey: string | undefined, clientId: string | undefined)
    {
        $("#clientIdInput").val(clientId || "");
        $("#apiKeyInput").val(apiKey || "");
    }

    public OnAdvancedSettingsSubmit()
    {
        var that = this;
        this.advSettingsForm.on("submit", function(e)
        {
            e.preventDefault();
            let result: {[key: string]: string} = {};
            that.advSettingsForm.serializeArray().forEach(element => 
            {
                result[element.name] = element.value;
            });
        });
    }

    private BindPlaylistOpElements()
    {
        var that = this;
        $("#play-playlist").on("click", function(event)
        {
            let data: any = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.NORMAL, data);
        })
        $("#playlist-op-replace").on("click", function(event)
        {
            let data: any = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.REPLACE, data);
        })
        $("#playlist-op-merge").on("click", function(event)
        {
            let data: any = $("#playlist-input").val();
            that.onPlaylistAction(Interaction.PlaylistPlayAction.MERGE, data);
        })
    }

    private BindVideoOpElements()
    {
        var that = this;

        $("#video-repeat").on("click", function(event)
        {
            that.onVideoAction(Interaction.VideoOperation.REPEAT, undefined);
        })

        $("#video-next").on("click", function(event)
        {
            that.onVideoAction(Interaction.VideoOperation.NEXT, undefined);
        })
    }

    private BindSaveOpElements()
    {
        var that = this;
        $("#save-progress").on("click", function(event)
        {
            that.onSaveAction(Interaction.SaveOperation.SAVE, undefined);
        })
        $("#saved-load").on("click", function(event)
        {
            that.onSaveAction(Interaction.SaveOperation.LOAD, undefined);
        })
        $("#saved-ignore").on("click", function(event)
        {
            that.onSaveAction(Interaction.SaveOperation.IGNORE, undefined);
        })
        $("#saved-discard").on("click", function(event)
        {
            that.onSaveAction(Interaction.SaveOperation.DISCARD, undefined);
        })
    }

    public ShowActivePlaylistOpModal()
    {
        $("#playlistExistOp").modal("show");
    }

    public ShowProgressOpModal()
    {
        $("#playlistSavedAskOp").modal("show");
    }
}
