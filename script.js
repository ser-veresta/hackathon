////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Global constants
const API_KEY = 'AIzaSyA7I9pVEE5qJwEbvxTEHCpHQDEuePtj8uo';
const CLIENT_ID = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

// HTML element constants
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const uploadedVideoContainer = document.getElementById('uploaded-video-container');
const sysGeneratedPlaylistContainer = document.getElementById('sys-generated-playlist-container');
const subscribersContainer = document.getElementById('subscribers-container');
const activitiesContainer = document.getElementById('activities-container');
const createPlaylistContainer = document.getElementById('create-playlist-container');
const updatePlaylistContainer = document.getElementById('update-playlist-container');
const searchContainer = document.getElementById('search-container');
const channelData = document.getElementById('channel-data');

// Some temprorary constants
let channel;
let tempId;
let tempTopicId;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Search form function  
searchForm.addEventListener('submit', e => {
    e.preventDefault();

    let search = searchInput.value;

    fetch(`https://kgsearch.googleapis.com/v1/entities:search?query=${search}&key=${API_KEY}&limit=1&indent=True`)
        .then(res => res.json())
        .then(data => {
            tempTopicId = data.itemListElement[0].result['@id'];
            tempTopicId = tempTopicId.slice(3);
            searchfunctionality(tempTopicId);
        });
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
        updatePlaylistContainer.style.display = 'none';
        searchContainer.style.display = 'none';
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
            <div class="row">
                <div class="col s4">
                    <a class="btn grey darken-2" target="_blank" href="https://youtube.com/channel/${channel.id}">
                    Visit Channel
                    </a>
                </div>
                <div class="col s4">
                    <button class="btn grey darken-2" type="button" id="subscribe-btn">Subscriptions</button> 
                </div>
                <div class="col s4">
                    <button class="btn grey darken-2" type="button" id="activitie-btn">User Activities</button>
                </div>
                <div class="col s4"> 
                    <button class="btn grey darken-2" type="button" id="uploaded-video-btn">Uploaded Videos</button> 
                </div>
                <div class="col s4">
                    <button class="btn grey darken-2" type="button" id="sys-generated-playlist-btn">System Generated Playlist
                    </button>
                </div>
                <div class="col s4"> 
                    <button class="btn grey darken-2" type="button" id="create-playlist-btn">Create Playlist</button> 
                </div>
                <div class="col s4">
                    <button class="btn grey darken-2" type="button" id="update-playlist-btn">Update Playlist</button> 
                </div>
            </div>
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

// Channel UI functionality function
function functionality(){
    switch(this.id){
        case "uploaded-video-btn":  requestUploadedVideos(channel.contentDetails.relatedPlaylists.uploads);
                                    uploadedVideoContainer.style.display = 'block'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'none';
                                    updatePlaylistContainer.style.display = 'none';
                                    searchContainer.style.display = 'none';
                                    break;
        
        case "sys-generated-playlist-btn":  const syGeneratedPlaylist = channel.contentDetails.relatedPlaylists;
                                            requestSystemGeneratedPlaylist([syGeneratedPlaylist.favorites,syGeneratedPlaylist.likes]);
                                            uploadedVideoContainer.style.display = 'none'; 
                                            sysGeneratedPlaylistContainer.style.display = 'block';
                                            subscribersContainer.style.display = 'none';
                                            activitiesContainer.style.display = 'none';
                                            createPlaylistContainer.style.display = 'none';
                                            updatePlaylistContainer.style.display = 'none';
                                            searchContainer.style.display = 'none';
                                            break;

        case "activitie-btn":   activities();
                                uploadedVideoContainer.style.display = 'none'; 
                                sysGeneratedPlaylistContainer.style.display = 'none';
                                subscribersContainer.style.display = 'none';
                                activitiesContainer.style.display = 'block';
                                createPlaylistContainer.style.display = 'none';
                                updatePlaylistContainer.style.display = 'none';
                                searchContainer.style.display = 'none';
                                break;

        case "subscribe-btn":   subscriptions();
                                uploadedVideoContainer.style.display = 'none'; 
                                sysGeneratedPlaylistContainer.style.display = 'none';
                                subscribersContainer.style.display = 'block';
                                activitiesContainer.style.display = 'none';
                                createPlaylistContainer.style.display = 'none';
                                updatePlaylistContainer.style.display = 'none';
                                searchContainer.style.display = 'none';
                                break;

        case "create-playlist-btn": createPlaylist();
                                    uploadedVideoContainer.style.display = 'none'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'block';
                                    updatePlaylistContainer.style.display = 'none';
                                    searchContainer.style.display = 'none';
                                    break;

        case "update-playlist-btn": updatePlaylist();
                                    uploadedVideoContainer.style.display = 'none'; 
                                    sysGeneratedPlaylistContainer.style.display = 'none';
                                    subscribersContainer.style.display = 'none';
                                    activitiesContainer.style.display = 'none';
                                    createPlaylistContainer.style.display = 'none';
                                    updatePlaylistContainer.style.display = 'block';
                                    searchContainer.style.display = 'none';
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
                        <iframe width="100%" height="400px" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
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
                <div class="col s6">
                    <iframe width="100%" height="400px" src="https://www.youtube.com/embed/videoseries?list=${item}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
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
        <div class="row">
            <div class="col s4"><h5>Title</h5></div>
            <div class="col s4"><h5>Type Of Activity</h5></div>
            <div class="col s4"><h5>Published At</h5></div>
        </div>
        `;


        items.forEach(item => {
            output += `
            <br>
            <div class="row">
                <div class="col s4">${item.snippet.title}</div>
                <div class="col s4">${item.snippet.type}</div>
                <div class="col s4">${item.snippet.publishedAt}</div>
            </div>
            `;
        });

        activitiesContainer.innerHTML = output;
    });
}

// To create a playlist
function createPlaylist(){
    let output = `
        <h4 class="center-align">Create Playlist</h4>
        <input type="text" placeholder="Enter Playlist Title" id="playlist-title" autocomplete="off">
        <input type="text" placeholder="Enter Playlist Description" id="playlist-description" autocomplete="off">
        <input type="text" placeholder="Enter Playlist Status ( private / public )" id="playlist-status" autocomplete="off">
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
            tempId = playlistId.value;
        })

        playlistStatus.value = '';
        playlistDescription.value= '';
        playlistTitle.value= '';
    }
}

// To update a playlist
function updatePlaylist(){
    let output = `
        <h4 class="center-align">Update Playlist</h4>
        <input type="text" placeholder="Enter Playlist Id" id="u-playlist-id" autocomplete="off">
        <input type="text" placeholder="Enter Playlist Title" id="u-playlist-title" autocomplete="off">
        <input type="text" placeholder="Enter Playlist Description" id="u-playlist-description" autocomplete="off">
        <input type="text" placeholder="Enter Playlist Status ( private / public )" id="u-playlist-status" autocomplete="off">
        <button class="btn grey darken-2" type="button" id="update-playlist">Update Playlist</button> 
    `;

    updatePlaylistContainer.innerHTML = output;

    let playlistTitle = document.getElementById('u-playlist-title');
    let playlistDescription = document.getElementById('u-playlist-description');
    let playlistStatus = document.getElementById('u-playlist-status');
    let playlistId = document.getElementById('u-playlist-id');

    if(tempId){
        playlistId.value = tempId;
    }

    document.getElementById('update-playlist').onclick = update;

    function update(){
        const requestOptions = {
            part: ['snippet,status'],
            resource: {
                id: playlistId.value,
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

// To search for videos usinig topic-based searching
function searchfunctionality(id){
    let count = 0;

    uploadedVideoContainer.style.display = 'none'; 
    sysGeneratedPlaylistContainer.style.display = 'none';
    subscribersContainer.style.display = 'none';
    activitiesContainer.style.display = 'none';
    createPlaylistContainer.style.display = 'none';
    updatePlaylistContainer.style.display = 'none';
    searchContainer.style.display = 'block';

    const requestOptions = {
        part: 'snippet',
        maxResults: 10,
        topicId: id,
        type: 'video'
    }

    const request = gapi.client.youtube.search.list(requestOptions);

    request.execute(res => {
        const listItems = res.items;
        if(listItems){
            let output = '<h4 class="center-align">Search Results</h4>'

            //loop through videos
            listItems.forEach(item => {
                const videoId = item.id.videoId;

                if(count === 10){
                    return;
                }

                if(item.id.kind.includes('video')){
                    output += `
                    <div class="col s12">
                        <h5>${item.snippet.title}</h5>
                        <iframe width="100%" height="600px" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                        </iframe>
                    </div>
                `;

                    count++;
                }
            });

            searchContainer.innerHTML = output;
        } 
        else{
            searchContainer.innerHTML = 'No resultls for given keyword'
        }
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////