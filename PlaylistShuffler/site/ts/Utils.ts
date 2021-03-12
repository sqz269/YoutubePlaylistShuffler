module Utils
{
    export function getQueryParams(qs: string, name: string)
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
    
    export function setCurrentStatusMessage(message: string, enableSpinner: boolean)
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
    
    export function getCookie(name: string)
    {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    
    export function setCookie(name: string, value: string)
    {
        document.cookie = `${name}=${value}; expires=Fri, 31 Dec 2037 23:59:59 GMT`;
    }
    
    export function shuffle(array: any[])
    {
        var currentIndex = array.length, temporaryValue, randomIndex;
    
        // While there remain elements to shuffle...
        while (0 !== currentIndex)
        {
    
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
    
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    
        return array;
    }
}
