import JsWebm from "jswebm";
import fs from "fs";

async function main() {
  const demuxer = new JsWebm();

  // grab buffer from the test_chunks folder
  const buffer = fs.readFileSync("./test_chunks/Chunk-1.mkv");
  const arrayBuffer = new Uint8Array(buffer).buffer;

  demuxer.queueData(arrayBuffer);
  while (!demuxer.eof) {
    demuxer.demux();
  }

  console.log(demuxer);
}

main();
