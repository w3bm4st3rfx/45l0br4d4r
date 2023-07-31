// Script para conectar HTML form a Firebase
// Tutorial Youtube:  https://www.youtube.com/watch?v=RAWHXRTKTHw&t=1016s
// Github: https://github.com/Vetrivel-VP/contact_form_firebase

// EU, Fernando, ADICIONEI código para melhorar a validação do email.
// Adicionei a funcionalidade de redirecionar após o email ser validado e enviado ao firebase

const firebaseConfig = {
    // Your web app's Firebase configuration
    // Vc acha esses dados pra copiar-colar nas configurações de cada projeto
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

  var emailid = document.getElementById("emailid").value;
  const errorMessage = document.getElementById('error-message');
  const redirectUrl = "https://radarbolsa.com/assinaturas/sucesso.html";  


// Se o email digitado for válido...
  if (validateEmail(emailid)) {
        
	  saveMessages(emailid);

      // redirecionamento após enviar dados para o Firebase
        window.location.href = redirectUrl;
              
	  // Eu desabilitei essa funcionalidade.
	  /*  enable alert
	  document.querySelector(".alert").style.display = "block";

	  //   remove the alert after 3 secs
	  setTimeout(() => {
		document.querySelector(".alert").style.display = "none";
	  }, 3000);

	  //   reset the form
	  document.getElementById("contactForm").reset(); 
	  */
 }
 
 else {
	 
   // msg DE ERRO
	 errorMessage.style.display = 'block';
     console.log("Email is invalid");

   //   remove a msg de Erro após 3 segs
	  setTimeout(() => {
		errorMessage.style.display = "none";
	  }, 3000);
	  
	document.getElementById("contactForm").reset();
   
   
	 }
}

 
 // Função  de validação do email via REGEX 
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
