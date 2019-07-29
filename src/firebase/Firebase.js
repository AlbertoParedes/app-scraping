import * as fb from 'firebase/app';
import "firebase/firestore";
var config = {
  apiKey: "AIzaSyA8xkfV1UBy4zwlTO38Zz4eiPOkzGoqH40",
  authDomain: "seo-yoseo-8f968.firebaseapp.com",
  databaseURL: "https://seo-yoseo-8f968.firebaseio.com",
  projectId: "seo-yoseo-8f968",
  storageBucket: "seo-yoseo-8f968.appspot.com",
  messagingSenderId: "795844045699",
  appId: "1:795844045699:web:d81415fb71ed0b5d"
};

const firebase = fb.initializeApp(config);
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);

export default firebase;