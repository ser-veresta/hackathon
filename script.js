const ApiKey = 'AIzaSyA7I9pVEE5qJwEbvxTEHCpHQDEuePtj8uo';

const OAuthId = '756283618964-mu7c6q41e3sgkr95mt6egsukt0dj6h5m.apps.googleusercontent.com';

const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=GoogleDevelopers&key=${ApiKey}`;

async function oauthSignIn(){
    const accessTokenReq = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http://localhost&response_type=token&client_id=${OAuthId}`;
    
    const data = await fetch(accessTokenReq,{method:'GET',headers:{Origin: 'https://quirky-keller-bcfa0c.netlify.app'}});

    console.log(data.json());
}

oauthSignIn();

console.log('for');