// Não Minifique pois dá problema !!

const myImage = document.getElementById("my-image");
    const myModal = document.getElementById("myModal");
    const myVideo = document.getElementById("my-video");

    myImage.addEventListener("click", function() {

      myModal.style.display = "block";

      myVideo.play();
    });

    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;";
    closeButton.className = "close";
    closeButton.addEventListener("click", function() {
      myModal.style.display = "none";
      myVideo.pause();
    });
    myModal.querySelector(".modal-content").appendChild(closeButton);

    window.addEventListener("click", function(event) {
      if (event.target == myModal) {
        myModal.style.display = "none";
        myVideo.pause();
      }
    });
