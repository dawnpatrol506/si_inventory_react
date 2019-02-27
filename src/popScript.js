const firebase = require('firebase');
var config = {
    apiKey: "AIzaSyD2CbEExz1gA7rxIviKjncl9Rpw03WpbXY",
    authDomain: "strandindinventory.firebaseapp.com",
    databaseURL: "https://strandindinventory.firebaseio.com",
    projectId: "strandindinventory",
    storageBucket: "strandindinventory.appspot.com",
    messagingSenderId: "854079353246"
};
firebase.initializeApp(config);

const db = firebase.database();
const store = firebase.firestore();

store.collection('inventory').doc('aa').collection('BLACK').get()
    .then(docs => {
        docs.forEach(doc => console.log(doc.data()))
    });
