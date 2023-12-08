document.addEventListener("DOMContentLoaded", function () {
  let mediaRecorder;
  let recordingInterval;
  let mediaStream;
  let countdownElement = document.querySelector(".countdown");

  addAvailableMimeTypes();

  document
    .querySelector(".stop-recording-button")
    .addEventListener("click", () => {
      stopRecording();
    });

  async function startRecording(mimeType) {
    let chunkCount = 0;
    document.body.classList.add("recording");
    document.querySelector(".chunks").innerHTML = "";
    let countdown = 18; // Recording duration in seconds
    countdownElement.textContent = countdown;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mimeType.includes("video"),
      });
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

      mediaRecorder.start(5000);
      countdownElement.textContent = countdown;

      recordingInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
          stopRecording();
        }
      }, 1000);

      // Handle recording data here
      // e.g., mediaRecorder.ondataavailable = ...
      mediaRecorder.ondataavailable = (e) => {
        chunkCount++;
        let a = document.createElement("a");
        a.download = `Chunk-${chunkCount}.mp4`;
        a.href = URL.createObjectURL(e.data);
        a.textContent = `Chunk ${chunkCount}`;
        document.querySelector(".chunks").appendChild(a);
      };
    } catch (err) {
      console.error(err);
      stopRecording();
    }
  }

  function stopRecording() {
    clearInterval(recordingInterval);
    mediaRecorder.stop();
    mediaStream.getTracks().forEach((track) => track.stop()); // Release the camera and microphone
    document.body.classList.remove("recording");
  }

  function addAvailableMimeTypes() {
    // Check and display available MIME types
    const mimeList = document.getElementById("mimeList");
    MediaRecorder.isTypeSupported =
      MediaRecorder.isTypeSupported ||
      function () {
        return false;
      };

    const types = ["video/webm", "audio/webm", "video/mp4"];
    types.forEach((type) => {
      if (MediaRecorder.isTypeSupported(type)) {
        let li = document.createElement("li");
        li.textContent = type;
        mimeList.appendChild(li);

        let button = document.createElement("button");
        button.textContent = `Record ${type}`;
        button.onclick = () => startRecording(type);
        document.querySelector(".select-mimetype").appendChild(button);
      }
    });
  }
});
