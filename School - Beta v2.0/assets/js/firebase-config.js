// Firebase Configuration - DISABLED
// Using localStorage only for data storage

const FirebaseConfig = null;

// Firebase stub functions - no longer used
function initFirebase() {
    console.log('Using localStorage only - Firebase disabled');
    return false;
}

function isFirebaseReady() {
    return false;
}

// Stub FirestoreDB object
const FirestoreDB = {
    saveCollection: function() { return false; },
    loadCollection: function() { return null; },
    saveAllData: function() { return false; },
    loadAllData: function() { return {}; }
};

window.FirebaseConfig = FirebaseConfig;
window.initFirebase = initFirebase;
window.isFirebaseReady = isFirebaseReady;
window.FirestoreDB = FirestoreDB;
