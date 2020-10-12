# YoutubePlaylistShuffler
Because A Trillion Dollar Corporation Can't Make Things Shuffle

## Demo
Website demo: https://sqz269.github.io/YoutubePlaylistShuffler/  

NOTE: API Key is provided, but it's recommended to follow the **Get Started** guide and create your own API key as the 
provided key may face quota limits. 

## Getting Started
### Enabling YouTube Data API v3
1. Go to https://console.cloud.google.com/apis/library/youtube.googleapis.com
2. Click on Enable (This is probably going to take a while)
3. After enabling the API. Go to https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials
4. On the top Click on `CREATE CREDENTIALS` and select `API KEY`
5. You should now see a popup with your API Key. Save it and keep it safe
---
1. _THE FOLLOWING STEPS ARE **OPTIONAL**. BUT IT IS REQUIRED IF YOU WANT TO PLAY **PRIVATE PLAYLISTS**_
2. On the top Click on **CREATE CREDENTIALS** and select `OAUTH client ID`
3. Click **CONFIGURE CONSENT SCREEN**
4. Select `EXTERNAL`
5. Enter any valid Application Name
6. Click Save
7. Go back to **Credentails** page using your right hand menu
8. On the top Click on `CREATE CREDENTIALS` and select `OAUTH client ID`
9. Select `Web application` for `Application Type`
10. Enter any name you want
11. **OPTIONAL** BUT SUGGESTED: RESTRICTING OAUTH CLIENT ID (Step 12)
12. Add **Authorised Javascript Origins** and **Authorized Redirect URLS**
    - Enter the Domain Name that is hosting the shuffler. For example, if you are using the one that is hosted on this repo then enter: https://sqz269.github.io (Note how `/YoutubePlaylistShuffler/` is stripped)
13. Click on Create
14. You should now see a popup with your Client Id. Save it and keep it safe
---

### Using API Keys and Client Id
1. Visit https://sqz269.github.io/YoutubePlaylistShuffler/
2. Click on Advanced Settings
3. Paste in your `API Key` and `Client Id`
4. Click on Apply
5. You should now be able to use the reshuffle freely
