import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseYouTubeId,
  youTubeErrorKind,
  youTubeWatchUrl,
} from "./youtube";

const ID = "dQw4w9WgXcQ";

test("reads the video id from every link YouTube's Share button produces", () => {
  const links = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=AbCdEf123&t=10`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}?si=x`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://music.youtube.com/watch?v=${ID}&list=RD`,
    `youtu.be/${ID}`,
    `www.youtube.com/watch?v=${ID}`,
    `  https://youtu.be/${ID}  `,
  ];
  for (const link of links) assert.equal(parseYouTubeId(link), ID, link);
});

test("rejects links that are not a single YouTube video", () => {
  const links = [
    "",
    "hello",
    "https://drive.google.com/file/d/abc/view",
    "https://www.youtube.com/",
    "https://www.youtube.com/@somechannel",
    "https://www.youtube.com/playlist?list=PL123",
    "https://www.youtube.com/watch?v=short",
    "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "https://files.tatugaschool.com/video.mp4",
  ];
  for (const link of links) assert.equal(parseYouTubeId(link), null, link);
});

test("stores a canonical watch link", () => {
  assert.equal(youTubeWatchUrl(ID), `https://www.youtube.com/watch?v=${ID}`);
  assert.equal(parseYouTubeId(youTubeWatchUrl(ID)), ID);
});

test("groups player error codes into what the teacher can do about them", () => {
  assert.equal(youTubeErrorKind(101), "embedBlocked");
  assert.equal(youTubeErrorKind(150), "embedBlocked");
  assert.equal(youTubeErrorKind(100), "notFound");
  assert.equal(youTubeErrorKind(2), "other");
  assert.equal(youTubeErrorKind(5), "other");
  assert.equal(youTubeErrorKind(153), "other");
});
