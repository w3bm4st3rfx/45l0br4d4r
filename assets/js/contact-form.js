const firebaseConfig={apiKey:"AIzaSyCuKt76DX2AGLUefdrJ7yQtT-a6gz0N600",authDomain:"contact-form-70381.firebaseapp.com",databaseURL:"https://contact-form-70381-default-rtdb.firebaseio.com",projectId:"contact-form-70381",storageBucket:"contact-form-70381.appspot.com",messagingSenderId:"381004057790",appId:"1:381004057790:web:620351cd8047479abe22ef"};firebase.initializeApp(firebaseConfig);var contactFormDB=firebase.database().ref("contactForm");function submitForm(e){e.preventDefault();var t=getElementVal("name"),a=getElementVal("emailid"),o=getElementVal("msgContent");saveMessages(t,a,o),document.querySelector(".alert").style.display="block",setTimeout((()=>{document.querySelector(".alert").style.display="none"}),3e3),document.getElementById("contactForm").reset()}document.getElementById("contactForm").addEventListener("submit",submitForm);const saveMessages=(e,t,a)=>{contactFormDB.push().set({name:e,emailid:t,msgContent:a})},getElementVal=e=>document.getElementById(e).value;