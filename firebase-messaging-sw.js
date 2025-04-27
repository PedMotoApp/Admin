importScripts('https://www.gstatic.com/firebasejs/7.16.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.16.0/firebase-messaging.js');

firebase.initializeApp({    
  'messagingSenderId': "698426579872",
  'projectId': "motok-a98db",
  'appId': "1:698426579872:web:bdd2fbb209a3bca1",
  'apiKey': "AIzaSyAC7n_qWJVeLhxIcr23kpjaeryp03HTXMM"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  // here you can override some options describing what's in the message; 
  // however, the actual content will come from the Webtask
  const notificationOptions = {
    icon: '/assets/imgs/logo.png'
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
