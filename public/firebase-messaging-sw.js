importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBJNc7N3O5_RwojAP_v0yn41bZ_Un6Dgkc',
    authDomain: 'freshy-noti.firebaseapp.com',
    projectId: 'freshy-noti',
    storageBucket: 'freshy-noti.firebasestorage.app',
    messagingSenderId: '733108231099',
    appId: '1:733108231099:web:23e833a0cb8f6f9d62829e',
    measurementId: 'G-K6D4TW11MZ',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
