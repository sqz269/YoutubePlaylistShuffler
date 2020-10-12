/**
 * Get query parameter from url
 * @param qs {string}
 * @param name {string}
 * @returns {Object}
 */
function getQueryParams(qs, name)
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

/**
 * Set status message on the nav bar
 * @param message {string}
 * @param enableSpinner {boolean}
 */
function setCurrentStatusMessage(message, enableSpinner)
{
    document.getElementById("status-message").innerText = message;

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

/**
 *
 * @param onclick {function}
 * @param timeout {string}
 */
function setToastrOptions(onclick = null, timeout = "5000")
{
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": onclick,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": timeout,
        "extendedTimeOut": "1500",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}

function getCookie(name)
{
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value)
{
    document.cookie = `${name}=${value}; expires=Fri, 31 Dec 2037 23:59:59 GMT`;
}

function shuffle(array)
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

window.addEventListener('load', function ()
{
    setToastrOptions();
});
