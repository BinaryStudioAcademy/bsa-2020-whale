export const environment = {
  production: true,
  apiUrl: 'http://bsa2020-whale.westeurope.cloudapp.azure.com:4201',
  meetingApiUrl: 'http://bsa2020-whale.westeurope.cloudapp.azure.com:4202',
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
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    debug: 1,
    config: {
      iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
          urls: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
        {
          urls: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
      ],
    },
  },
};
