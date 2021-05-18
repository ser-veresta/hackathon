const CLIENT_ID = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'GoogleDevelopers';

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
        getChannel(defaultChannel);
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

// Get channel from api 
function getChannel(channel){
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
    })
    .then(res => {
        console.log(res);
    })
    .catch(err => alert('No Channel By That Name'));
}