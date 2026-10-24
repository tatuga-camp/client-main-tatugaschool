import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mascotForPhoto,
  mascotVideoFormat,
  moodForPoints,
  onMascotReact,
  pickIdleToPlay,
  reactMascot,
} from "./mascot";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `s${i}`);

test("mascotForPhoto maps cartoon avatars only", () => {
  assert.ok(mascotForPhoto("https://storage.tatugaschool.com/AVATAR/16.png"));
  assert.equal(
    mascotForPhoto("https://storage.tatugaschool.com/students/photo.jpg"),
    null,
  );
  assert.equal(mascotForPhoto(undefined), null);
});

test("pickIdleToPlay caps concurrent plays at 20% of cards", () => {
  assert.equal(pickIdleToPlay(ids(40), 0, 40).length, 8);
  assert.equal(pickIdleToPlay(ids(35), 5, 40).length, 3);
  assert.deepEqual(pickIdleToPlay(ids(32), 8, 40), []);
});

test("pickIdleToPlay lets at least one card play in a small class", () => {
  assert.equal(pickIdleToPlay(ids(3), 0, 3).length, 1);
  assert.deepEqual(pickIdleToPlay(ids(2), 1, 3), []);
  assert.deepEqual(pickIdleToPlay([], 0, 0), []);
});

test("pickIdleToPlay never picks the same card twice", () => {
  const picked = pickIdleToPlay(ids(10), 0, 50, () => 0);
  assert.deepEqual(picked, ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"]);
});

test("mascotVideoFormat serves HEVC to WebKit-only browsers, WebM elsewhere", () => {
  const chrome =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  const macChrome =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  const edge =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0";
  const safari =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
  const iosChrome =
    "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1";
  const firefox =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0";
  // Chromium on a Mac can decode HEVC but drops its alpha: still WebM.
  assert.equal(mascotVideoFormat(chrome, false), "webm");
  assert.equal(mascotVideoFormat(macChrome, true), "webm");
  assert.equal(mascotVideoFormat(edge, true), "webm");
  assert.equal(mascotVideoFormat(firefox, false), "webm");
  assert.equal(mascotVideoFormat(safari, true), "hevc");
  assert.equal(mascotVideoFormat(iosChrome, true), "hevc");
  // Old WebKit without HEVC keeps the still picture.
  assert.equal(mascotVideoFormat(safari, false), null);
});

test("mascot clips point at both formats with encoded names", () => {
  const clips = mascotForPhoto("https://storage.tatugaschool.com/AVATAR/16.png");
  assert.deepEqual(clips?.happy[0], {
    webm: "https://storage.tatugaschool.com/AVATAR/animation/mascot_16/Jumps%20for%20joy.webm",
    hevc: "https://storage.tatugaschool.com/AVATAR/animation/mascot_16/Jumps%20for%20joy.mov",
  });
  assert.deepEqual(clips?.sad, [
    {
      webm: "https://storage.tatugaschool.com/AVATAR/animation/mascot_16/Thumbs%20down%20gesture.webm",
      hevc: "https://storage.tatugaschool.com/AVATAR/animation/mascot_16/Thumbs%20down%20gesture.mov",
    },
  ]);
});

test("moodForPoints: happy for points, sad for deductions, none for zero", () => {
  assert.equal(moodForPoints(2), "happy");
  assert.equal(moodForPoints(-1), "sad");
  assert.equal(moodForPoints(0), null);
});

test("reactMascot reaches subscribers until they unsubscribe", () => {
  const heard: string[] = [];
  const off = onMascotReact((id, mood) => heard.push(`${id}:${mood}`));
  reactMascot("a", "happy");
  reactMascot("b", "sad");
  off();
  reactMascot("c", "happy");
  assert.deepEqual(heard, ["a:happy", "b:sad"]);
});
