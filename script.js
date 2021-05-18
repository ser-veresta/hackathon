const CLIENT_ID = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const uploadedVideoContainer = document.getElementById('uploaded-video-container');
const sysGeneratedPlaylistContainer = document.getElementById('sys-generated-playlist-container');
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
        uploadedVideoContainer.style.display = 'block';
        sysGeneratedPlaylistContainer.style.display = 'block';
        getChannel();
    }
    else{
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        uploadedVideoContainer.style.display = 'none'; 
        sysGeneratedPlaylistContainer.style.display = 'none';
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

    if(false){
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

        const uploadPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
        requestUploadVideoplaylist(uploadPlaylistId);

        const sysGeneratedPlaylist = channel.contentDetails.relatedPlaylists;
        createdPlaylist([sysGeneratedPlaylist.favorites,sysGeneratedPlaylist.likes]);
    })
    .catch(err => alert('No Channel By That Name'));
}

// To show the uploaded videos in the channel 
function requestUploadVideoplaylist(uploadPlaylistId){
    const requestOptions = {
        playlistId: uploadPlaylistId,
        part: 'snippet',
        maxResults: 10
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(res => {
        const listItems = res.result.items;
        if(listItems){
            let output = '<h4 class="center-align">Uploaded Videos</h4>'

            //loop through videos
            listItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
                    <div class="col s3">
                        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                        </iframe>
                    </div>
                `;
            });

            uploadedVideoContainer.innerHTML = output;
        } 
        else{
            uploadedVideoContainer.innerHTML = 'No Uploaded Videos'
        }
    })
}

// To show the created playlist in the channel
function createdPlaylist(sysGeneratedPlaylist){
    if(sysGeneratedPlaylist){
        let output = '<h4 class="center-align">System Generated Playlists</h4>'

        //loop through videos
        sysGeneratedPlaylist.forEach(item => {
            output += `
                <div class="col s3">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=${item}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                </div>
            `;
        });

        sysGeneratedPlaylistContainer.innerHTML = output;
    } 
    else{
        sysGeneratedPlaylistContainer.innerHTML = 'No System Generated Playlists'
    }
}