const CLIENT_ID = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');
const channelData = document.getElementById('channel-data');

//form submit & change channel 
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    let channel = channelInput.value;

    getChannel(channel);
})

// Load the auth2 library
function handleClientLoad(){
    gapi.load('client:auth2', initClient); 
}

// Init api library and set up sign in listeners
function initClient(){
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPE 
    })
    .then(()=> {
        // Listen for signin state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle initial signin state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignouotClick;
    });
}

// Update UI base on sign in 
function updateSigninStatus(isSignedIn){
    if(isSignedIn){
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel();
    }
    else{
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none'; 
    }
}

// Handle login 
function handleAuthClick(){
    gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignouotClick(){
    gapi.auth2.getAuthInstance().signOut();
}

// Display channel info
function showChannelInfo(data){
    channelData.innerHTML = data;
}

// Get channel from api 
function getChannel(channel = undefined){
    let params;

    if(channel){
        params = {
            part: 'snippet,contentDetails,statistics',
            forUsername: channel
        }; 
    }
    else{
        params = {
            part: 'snippet,contentDetails,statistics',
            mine: true
        }; 
    }

    gapi.client.youtube.channels.list(params)
    .then(res => {
        console.log(res);
        const channel = res.result.items[0];

        const output = `
            <ul class="collection">
                <li class="collection-item">Title: ${channel.snippet.title}</li>
                <li class="collection-item">ID: ${channel.id}</li>
                <li class="collection-item">Subscribers: ${channel.statistics.subscriberCount}</li>
                <li class="collection-item">Views: ${channel.statistics.viewCount}</li>
                <li class="collection-item">Videos: ${channel.statistics.videoCount}</li>
            </ul>
            <p>${channel.snippet.description}</p>
            <hr>
            <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">
                Visit Channel
            </a>
        `;
        showChannelInfo(output);

        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoplaylist(playlistId);
    })
    .catch(err => alert('No Channel By That Name'));
}

//to show the videos in the channel 
function requestVideoplaylist(playlistId){
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(res => {
        const listItems = res.result.items;
        if(listItems){
            let output = '<h4 class="center-align">Latest Videos</h4>'

            //loop through videos
            listItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
                    <div class="col s3">
                        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            });

            videoContainer.innerHTML = output;
        } 
        else{
            videoContainer.innerHTML = 'No Uploaded Videos'
        }
    })
}