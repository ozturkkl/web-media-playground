const videoTypes = ["webm", "ogg", "mp4", "x-matroska"];
const audioTypes = ["webm", "ogg", "mp3", "x-matroska"];
const codecs = [
  "should-not-be-supported",
  "vp9",
  "vp9.0",
  "vp8",
  "vp8.0",
  "avc1",
  "av1",
  "h265",
  "h.265",
  "h264",
  "h.264",
  "opus",
  "pcm",
  "aac",
  "mpeg",
  "mp4a",
];

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

      mediaRecorder.start();
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
        a.download = `Chunk-${chunkCount}`;
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

    const types = [];
    codecs.forEach((codec) => {
      videoTypes.forEach((type) => {
        types.push(`video/${type};codecs=${codec}`);
      });
      audioTypes.forEach((type) => {
        types.push(`audio/${type};codecs=${codec}`);
      });
    });

    const VideoCodecsHeader = document.createElement("h3");
    VideoCodecsHeader.textContent = "Audio Codecs";
    document.querySelector(".select-mimetype").appendChild(VideoCodecsHeader);
    types
      .filter((type) => !type.includes("video"))
      .forEach((type) => {
        if (MediaRecorder.isTypeSupported(type)) {
          let button = document.createElement("button");
          button.textContent = type;
          button.onclick = () => startRecording(type);
          document.querySelector(".select-mimetype").appendChild(button);
        }
      });

    const AudioCodecsHeader = document.createElement("h3");
    AudioCodecsHeader.textContent = "Video Codecs";
    document.querySelector(".select-mimetype").appendChild(AudioCodecsHeader);
    types
      .filter((type) => type.includes("video"))
      .forEach((type) => {
        if (MediaRecorder.isTypeSupported(type)) {
          let button = document.createElement("button");
          button.textContent = type;
          button.onclick = () => startRecording(type);
          document.querySelector(".select-mimetype").appendChild(button);
        }
      });
  }
});
