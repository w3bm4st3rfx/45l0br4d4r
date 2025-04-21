const firebaseConfig = {
  apiKey: "AIzaSyBBSa9WAOYT4m1asbuWduYLNvExo2bTW2k",
  authDomain: "radarbitcoin-f6027.firebaseapp.com",
  projectId: "radarbitcoin-f6027",
  storageBucket: "radarbitcoin-f6027.firebasestorage.app",
  messagingSenderId: "930166885188",
  appId: "1:930166885188:web:e727fb9b4114cc9b60a511"
};




firebase.initializeApp(firebaseConfig);

var contactFormDB = firebase.database().ref("contactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var emailid = document.getElementById("emailid").value;
  const errorMessage = document.getElementById('error-message');
  const redirectUrl = "https://radarbolsa.com/assinaturas/sucesso-dt.html";  


  if (validateEmail(emailid)) {
        
	  saveMessages(emailid);

        window.location.href = redirectUrl;
              
 }
 
 else {
	 
	 errorMessage.style.display = 'block';
     console.log("Email is invalid");

	  setTimeout(() => {
		errorMessage.style.display = "none";
	  }, 3000);
	  
	document.getElementById("contactForm").reset();
   
   
	 }
}

 
  function validateEmail(emailid) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(emailid);
    }
    
const saveMessages = (emailid) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    emailid: emailid,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
