const CLIENT_ID = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const uploadedVideoContainer = document.getElementById('uploaded-video-container');
const sysGeneratedPlaylistContainer = document.getElementById('sys-generated-playlist-container');
const subscribersContainer = document.getElementById('subscribers-container');
const activitiesContainer = document.getElementById('activities-container');
const createPlaylistContainer = document.getElementById('create-playlist-container');
const updatePlaylistContainer = document.getElementById('update-playlist-container');
const channelData = document.getElementById('channel-data');

let channel;

//form submit 
// channelForm.addEventListener('submit', e => {
//     e.preventDefault();

//     let channel = channelInput.value;

//     getChannel(channel);
// })

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
        getChannel();
    }
    else{
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        uploadedVideoContainer.style.display = 'none'; 
        sysGeneratedPlaylistContainer.style.display = 'none';
        subscribersContainer.style.display = 'none';
        activitiesContainer.style.display = 'none';
        createPlaylistContainer.style.display = 'none';
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
function getChannel(){
    let params = {
        part: 'snippet,contentDetails,statistics',
        mine: true
    }; 

    gapi.client.youtube.channels.list(params)
    .then(res => {
        console.log(res);
        channel = res.result.items[0];

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
            <a class="btn grey darken-2" target="_blank" href="https://youtube.com/channel/${channel.id}">
                Visit Channel
            </a>
            <button class="btn grey darken-2" type="button" id="subscribe-btn">Subscriptions</button> 
            <button class="btn grey darken-2" type="button" id="activitie-btn">User Activities</button> 
            <button class="btn grey darken-2" type="button" id="uploaded-video-btn">Uploaded Videos</button> 
            <button class="btn grey darken-2" type="button" id="sys-generated-playlist-btn">System Generated Playlist</button> 
            <button class="btn grey darken-2" type="button" id="create-playlist-btn">Create Playlist</button> 
            <button class="btn grey darken-2" type="button" id="update-playlist-btn">Update Playlist</button> 
        `;
        showChannelInfo(output);

        document.getElementById('subscribe-btn').onclick = functionality;
        document.getElementById('activitie-btn').onclick = functionality;
        document.getElementById('uploaded-video-btn').onclick = functionality;
        document.getElementById('sys-generated-playlist-btn').onclick = functionality;
        document.getElementById('create-playlist-btn').onclick = functionality;
        document.getElementById('update-playlist-btn').onclick = functionality;
    })
    .catch(err => alert('No Channel By That Name'));
}

function functionality(){
    switch(this.id){
        case "uploaded-video-btn":  requestUploadedVideos(channel.contentDetails.relatedPlaylists.uploads);
                                    uploadedVideoContainer.style.display = 'block'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'none';
                                    break;
        
        case "sys-generated-playlist-btn":  const syGeneratedPlaylist = channel.contentDetails.relatedPlaylists;
                                            requestSystemGeneratedPlaylist([syGeneratedPlaylist.favorites,syGeneratedPlaylist.likes]);
                                            uploadedVideoContainer.style.display = 'none'; 
                                            sysGeneratedPlaylistContainer.style.display = 'block';
                                            subscribersContainer.style.display = 'none';
                                            activitiesContainer.style.display = 'none';
                                            createPlaylistContainer.style.display = 'none';
                                            break;

        case "activitie-btn":   activities();
                                uploadedVideoContainer.style.display = 'none'; 
                                sysGeneratedPlaylistContainer.style.display = 'none';
                                subscribersContainer.style.display = 'none';
                                activitiesContainer.style.display = 'block';
                                createPlaylistContainer.style.display = 'none';
                                break;

        case "subscribe-btn":   subscriptions();
                                uploadedVideoContainer.style.display = 'none'; 
                                sysGeneratedPlaylistContainer.style.display = 'none';
                                subscribersContainer.style.display = 'block';
                                activitiesContainer.style.display = 'none';
                                createPlaylistContainer.style.display = 'none';
                                break;

        case "create-playlist-btn": createPlaylist();
                                    uploadedVideoContainer.style.display = 'none'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'block';
                                    break;

        case "update-playlist-btn": updatePlaylist();
                                    uploadedVideoContainer.style.display = 'none'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'block';
                                    break;
    }
}

// To show the uploaded videos in the channel 
function requestUploadedVideos(uploadPlaylistId){
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
                    <div class="col s6">
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
    });
}

// To show the created playlist in the channel
function requestSystemGeneratedPlaylist(sysGeneratedPlaylist){
    let output = '<h4 class="center-align">System Generated Playlists</h4>'
    let flag = false;

    //loop through videos
    sysGeneratedPlaylist.forEach(item => {
        if(item !== ""){
            flag = true;
            output += `
                <div class="col s3">
                    <iframe width="100%" height="auto" src="https://www.youtube.com/embed/videoseries?list=${item}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                </div>
            `;
        }
    });

    if(!flag){
        sysGeneratedPlaylistContainer.innerHTML = 'No System Generated Playlist';
    }
    else{
        sysGeneratedPlaylistContainer.innerHTML = output;
    }
}

// To diplay the subscriptions 
function subscriptions(){
    const requestOptions = {
        part: 'snippet',
        channelId: channel.id,
        maxResults: 20
    };

    const request = gapi.client.youtube.subscriptions.list(requestOptions);

    request.execute(res => {
        const items = res.items;

        let output = '<h4 class="center-align">Subscribers</h4>';

        output += '<ul class="collection">';

        items.forEach(item => {
            output += `<li class="collection-item">${item.snippet.title} </li>`
        });

        output += '</ul>';

        subscribersContainer.innerHTML = output;
    })
}

// To display the activities
function activities(){
    const requestOptions = {
        part: 'snippet',
        channelId: channel.id,
        maxResults: 20
    };

    const request = gapi.client.youtube.activities.list(requestOptions);

    request.execute(res => {
        const items = res.items;

        let output = '<h4 class="center-align">User Activities</h4>';

        output += `
            <ul class="collection">
                <li class="collection-item">Title  Type  Published At</li>
        `;


        items.forEach(item => {
            output += `<li class="collection-item">${item.snippet.title} ${item.snippet.type} ${item.snippet.publishedAt}</li>`
        });

        output += '</ul>';

        activitiesContainer.innerHTML = output;
    });
}

function createPlaylist(){
    let output = `
        <h4 class="center-align">Create Playlist</h4>
        <input type="text" placeholder="Enter Playlist Title" id="playlist-title">
        <input type="text" placeholder="Enter Playlist Description" id="playlist-description">
        <input type="text" placeholder="Enter Playlist Status ( private / public )" id="playlist-status">
        <input type="text" placeholder="Playlist Id (copy this for update)" id="playlist-id" readonly>
        <button class="btn grey darken-2" type="button" id="create-playlist">Create Playlist</button> 
    `;

    createPlaylistContainer.innerHTML = output

    let playlistTitle = document.getElementById('playlist-title');
    let playlistDescription = document.getElementById('playlist-description');
    let playlistStatus = document.getElementById('playlist-status');
    let playlistId = document.getElementById('playlist-id');

    document.getElementById('create-playlist').onclick = create;

    function create(){
        const requestOptions = {
            part: ['snippet,status'],
            resource: {
                snippet: {
                    title: playlistTitle.value,
                    description: playlistDescription.value,
                    defaultLanguage: 'en'
                },
                status: {
                    privacyStatus: playlistStatus.value
                }
            }
        }
    
        const request = gapi.client.youtube.playlists.insert(requestOptions);

        request.execute(res => {
            console.log(res);
            playlistId.value = res.id;
        })

        playlistStatus.value = '';
        playlistDescription.value= '';
        playlistTitle.value= '';

        console.log(playlistId.value);

    }
}

function updatePlaylist(){
    let output = `
        <h4 class="center-align">Update Playlist</h4>
        <input type="text" placeholder="Enter Playlist Id" id="u-playlist-id">
        <input type="text" placeholder="Enter Playlist Title" id="u-playlist-title">
        <input type="text" placeholder="Enter Playlist Description" id="u-playlist-description">
        <input type="text" placeholder="Enter Playlist Status ( private / public )" id="u-playlist-status">
        <button class="btn grey darken-2" type="button" id="update-playlist">Create Playlist</button> 
    `;

    createPlaylistContainer.innerHTML = output

    let playlistTitle = document.getElementById('u-playlist-title');
    let playlistDescription = document.getElementById('u-playlist-description');
    let playlistStatus = document.getElementById('u-playlist-status');
    let playlistId = document.getElementById('u-playlist-id');

    document.getElementById('update-playlist').onclick = update;

    function update(){
        const requestOptions = {
            part: ['snippet,status'],
            id: playlistId.value,
            resource: {
                snippet: {
                    title: playlistTitle.value,
                    description: playlistDescription.value,
                    defaultLanguage: 'en'
                },
                status: {
                    privacyStatus: playlistStatus.value
                }
            }
        }
    
        const request = gapi.client.youtube.playlists.update(requestOptions);

        request.execute(res => {
            console.log(res);
        })

        playlistStatus.value = '';
        playlistDescription.value= '';
        playlistTitle.value= '';
        playlistId.value = '';
    }
}