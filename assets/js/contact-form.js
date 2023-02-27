
// Script para conectar HTML form a Firebase
// Tutorial Youtube:  https://www.youtube.com/watch?v=RAWHXRTKTHw&t=1016s
// Github: https://github.com/Vetrivel-VP/contact_form_firebase


const firebaseConfig = {
    // Your web app's Firebase configuration
    apiKey: "AIzaSyCuKt76DX2AGLUefdrJ7yQtT-a6gz0N600",
    authDomain: "contact-form-70381.firebaseapp.com",
    databaseURL: "https://contact-form-70381-default-rtdb.firebaseio.com",
    projectId: "contact-form-70381",
    storageBucket: "contact-form-70381.appspot.com",
    messagingSenderId: "381004057790",
    appId: "1:381004057790:web:620351cd8047479abe22ef"
  };

// initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var contactFormDB = firebase.database().ref("contactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var emailid = getElementVal("emailid");
  var msgContent = getElementVal("msgContent");

  saveMessages(name, emailid, msgContent);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  document.getElementById("contactForm").reset();
}

const saveMessages = (name, emailid, msgContent) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    name: name,
    emailid: emailid,
    msgContent: msgContent,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
