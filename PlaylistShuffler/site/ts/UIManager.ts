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
    onPlaylistAction: ((type: Interaction.PlaylistPlayAction, data: any) => any | undefined);

    onVideoAction: ((type: Interaction.VideoOperation, data: any) => any | undefined);

    onSaveAction: ((type: Interaction.SaveOperation, data: any) => any | undefined);

    constructor(onPlaylistAction: (type: Interaction.PlaylistPlayAction, data: any) => any, 
                onVideoAction: (type: Interaction.VideoOperation, data: any) => any, 
                onSaveAction: (type: Interaction.SaveOperation, data: any) => any)
    {
        this.onPlaylistAction = onPlaylistAction;
        this.onVideoAction = onVideoAction;
        this.onSaveAction = onSaveAction;

        this.SetToastrOption();
    }

    public SetToastrOption()
    {
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 3000;
        toastr.options.progressBar = true;
    }

    public BindElements()
    {
        this.BindPlaylistOpElements();
        this.BindSaveOpElements();
        this.BindVideoOpElements();
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
        $("#playlistExistOp").show();
    }
}
