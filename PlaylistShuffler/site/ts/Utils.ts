module Utils
{
    export function GetQueryParams(qs: string, name: string)
    {
        try
        {
            let url = new URL(qs);
            return url.searchParams.get(name);
        } catch (e)
        {
            return null;
        }
    }
    
    export function SetCurrentStatusMessage(message: string, enableSpinner: boolean)
    {
        document.getElementById("status-message")!.innerText = message;
    
        let spinElement = $("#status-spin");
        if (enableSpinner)
        {
            if (spinElement.hasClass("d-none"))
                spinElement.removeClass("d-none");
        } else
        {
            if (!spinElement.hasClass("d-none"))
                spinElement.addClass("d-none");
        }
    }
    
    export function GetCookie(name: string)
    {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    
    export function SetCookie(name: string, value: string)
    {
        document.cookie = `${name}=${value}; expires=Fri, 31 Dec 2037 23:59:59 GMT`;
    }
    
    export function Shuffle(arr: any[])
    {
        let i = arr.length, j, temp;
        while(--i > 0){
          j = Math.floor(Math.random()*(i+1));
          temp = arr[j];
          arr[j] = arr[i];
          arr[i] = temp;
        }
    }
}
