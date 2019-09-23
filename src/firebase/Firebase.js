import * as fb from 'firebase/app';
import "firebase/firestore";
require('dotenv').config()
console.log(process.env);

const config = JSON.parse(process.env.REACT_APP_FIREBASE_KEY)
const firebase = fb.initializeApp(config);
firebase.firestore();
//const settings = {/* your settings... */ timestampsInSnapshots: true };
//firestore.settings(settings);

export default firebase;