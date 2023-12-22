import JsWebm from "jswebm";
import mkvdemuxjs from "mkvdemuxjs";
import fs from "fs";
import { Decoder } from "ebml";
import { EbmlStreamDecoder } from "ebml-stream";

function main() {
  // grab buffer from the test_chunks folder
  const codec = "avc1";
  const chunk1 = fs.readFileSync(`./test_chunks/${codec}/Chunk-1.mkv`);
  const chunk2 = fs.readFileSync(`./test_chunks/${codec}/Chunk-2.mkv`);
  const chunk3 = fs.readFileSync(`./test_chunks/${codec}/Chunk-3.mkv`);
  const chunk4 = fs.readFileSync(`./test_chunks/${codec}/Chunk-4.mkv`);

  const combined = Buffer.concat([chunk1]);

  // useJsWebm(combined);
  // useMkvdemuxjs(combined);
  useEbmlDecoder(combined);
}

async function useJsWebm(combined) {
  const demuxer = new JsWebm();
  const arrayBuffer = new Uint8Array(combined).buffer;

  demuxer.queueData(arrayBuffer);
  while (!demuxer.eof) {
    demuxer.demux();
  }

  console.log(demuxer);
}

async function useMkvdemuxjs(combined) {
  const arrayBuffer = new Uint8Array(combined).buffer;
  let mkvDemuxer = new mkvdemuxjs.MkvDemux();
  let part = null;

  mkvDemuxer.push(arrayBuffer);
  while ((part = mkvDemuxer.demux()) !== null) {
    console.log(part);
  }
}

async function useEbmlDecoder(data) {
  const decoder = new Decoder();

  decoder.on("data", (chunk) => {
    chunk = chunk[1];
    if (chunk?.name === "SimpleBlock") {
      console.log(`Value: ${chunk?.value}, Size: ${chunk?.dataSize}, TrackNumber: ${chunk.track}, Keyframe: ${chunk.keyframe}, Start: ${chunk.start}, End: ${chunk.end}`)
    } else {
      console.log({
        [chunk?.name]: {
          Value: chunk?.value,
          Size: chunk?.dataSize,
          Data: chunk?.data,
          Start: chunk?.start,
          End: chunk?.end,
        },
      });
    }
  });

  decoder.write(data);
}

main();
