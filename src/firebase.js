import firebase from 'firebase/app';
import 'firebase/firestore';

var config = {
    apiKey: "AIzaSyD2CbEExz1gA7rxIviKjncl9Rpw03WpbXY",
    authDomain: "strandindinventory.firebaseapp.com",
    databaseURL: "https://strandindinventory.firebaseio.com",
    projectId: "strandindinventory",
    storageBucket: "strandindinventory.appspot.com",
    messagingSenderId: "854079353246"
};
firebase.initializeApp(config);
const db = firebase.firestore();


export default db;