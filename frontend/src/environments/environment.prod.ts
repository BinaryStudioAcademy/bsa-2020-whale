export const environment = {
  production: true,
  apiUrl: 'https://bsa2020-whale.westeurope.cloudapp.azure.com/api',
  meetingApiUrl: 'https://bsa2020-whale.westeurope.cloudapp.azure.com/meetingapi',
  signalrUrl: 'https://bsa2020-whale.westeurope.cloudapp.azure.com/hubs',
  firebase: {
    apiKey: 'AIzaSyCdb8h9YMeJBdcIM5wK_w6Mcw7ZI1CVJAk',
    authDomain: 'bsa-whale.firebaseapp.com',
    databaseURL: 'https://bsa-whale.firebaseio.com',
    projectId: 'bsa-whale',
    storageBucket: 'bsa-whale.appspot.com',
    messagingSenderId: '893944865679',
    appId: '1:893944865679:web:9b055d730e3a27b66961fa',
  },
  googleClientId:
    '893944865679-eav20gfr3sbintikhq42dhhc414loq4p.apps.googleusercontent.com',
  peerOptions: {
    key: 'peerjs',
    host: 'whale-peerjs-server.herokuapp.com',
    port: 443,
    path: '/',
    secure: true,
    debug: 3,
    config: {
      iceServers: [
        // { urls: 'stun:bsa2020-whale-webrtc.westeurope.cloudapp.azure.com:5349' },
        {
          urls: 'turn:bsa2020-whale-webrtc.westeurope.cloudapp.azure.com:5349',
          username: 'bsa2020whale',
          credential: 'bsa2020whale'
        }
      ],
    },
  },
};
