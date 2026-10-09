import { Language } from "../../interfaces";

export const videoConfigLanguage = {
  videoPreview: (language: Language) => {
    switch (language) {
      case "en":
        return "Video Preview";
      case "th":
        return "ตัวอย่างวิดีโอ";
      default:
        return "Video Preview";
    }
  },
  addQuestionAtCurrentTime: (language: Language) => {
    switch (language) {
      case "en":
        return "Add Question at Current Time";
      case "th":
        return "เพิ่มคำถามที่เวลานี้";
      default:
        return "Add Question at Current Time";
    }
  },
  pauseVideoTip: (language: Language) => {
    switch (language) {
      case "en":
        return "Pause video to add question at specific time";
      case "th":
        return "หยุดวิดีโอเพื่อเพิ่มคำถามในเวลาที่ต้องการ";
      default:
        return "Pause video to add question at specific time";
    }
  },
  configuration: (language: Language) => {
    switch (language) {
      case "en":
        return "Configuration";
      case "th":
        return "การตั้งค่า";
      default:
        return "Configuration";
    }
  },
  playbackSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Playback Settings";
      case "th":
        return "ตั้งค่าการเล่น";
      default:
        return "Playback Settings";
    }
  },
  preventFastForward: (language: Language) => {
    switch (language) {
      case "en":
        return "Prevent Fast Forward";
      case "th":
        return "ห้ามกรอวิดีโอ";
      default:
        return "Prevent Fast Forward";
    }
  },
  popupQuestions: (language: Language) => {
    switch (language) {
      case "en":
        return "Popup Questions";
      case "th":
        return "คำถามป๊อปอัพ";
      default:
        return "Popup Questions";
    }
  },
  newQuestionAt: (language: Language) => {
    switch (language) {
      case "en":
        return "New Question at";
      case "th":
        return "คำถามใหม่ที่เวลา";
      default:
        return "New Question at";
    }
  },
  questionTextPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Question text";
      case "th":
        return "คำถาม";
      default:
        return "Question text";
    }
  },
  options: (language: Language) => {
    switch (language) {
      case "en":
        return "Options";
      case "th":
        return "ตัวเลือก";
      default:
        return "Options";
    }
  },
  optionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Option";
      case "th":
        return "ตัวเลือก";
      default:
        return "Option";
    }
  },
  addOption: (language: Language) => {
    switch (language) {
      case "en":
        return "+ Add Option";
      case "th":
        return "+ เพิ่มตัวเลือก";
      default:
        return "+ Add Option";
    }
  },
  saveQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Question";
      case "th":
        return "บันทึกคำถาม";
      default:
        return "Save Question";
    }
  },
  noQuestions: (language: Language) => {
    switch (language) {
      case "en":
        return "No questions added yet.";
      case "th":
        return "ยังไม่มีคำถาม";
      default:
        return "No questions added yet.";
    }
  },
  saveConfiguration: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Configuration";
      case "th":
        return "บันทึกการตั้งค่า";
      default:
        return "Save Configuration";
    }
  },
  videoTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Video";
      case "th":
        return "วิดีโอ";
      default:
        return "Video";
    }
  },
  videoHelper: (language: Language) => {
    switch (language) {
      case "en":
        return "Pause anywhere and add a question — students answer it before the video continues.";
      case "th":
        return "หยุดวิดีโอตรงไหนก็ได้แล้วเพิ่มคำถาม นักเรียนต้องตอบก่อนดูต่อ";
      default:
        return "Pause anywhere and add a question — students answer it before the video continues.";
    }
  },
  replaceVideo: (language: Language) => {
    switch (language) {
      case "en":
        return "Replace video";
      case "th":
        return "เปลี่ยนวิดีโอ";
      default:
        return "Replace video";
    }
  },
  uploadTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload the lesson video";
      case "th":
        return "อัปโหลดวิดีโอบทเรียน";
      default:
        return "Upload the lesson video";
    }
  },
  uploadHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Drop a video file here or choose one. Up to 2 GB.";
      case "th":
        return "ลากไฟล์วิดีโอมาวางที่นี่ หรือเลือกไฟล์ ขนาดไม่เกิน 2 GB";
      default:
        return "Drop a video file here or choose one. Up to 2 GB.";
    }
  },
  chooseVideo: (language: Language) => {
    switch (language) {
      case "en":
        return "Choose video";
      case "th":
        return "เลือกวิดีโอ";
      default:
        return "Choose video";
    }
  },
  uploading: (language: Language) => {
    switch (language) {
      case "en":
        return "Uploading video";
      case "th":
        return "กำลังอัปโหลดวิดีโอ";
      default:
        return "Uploading video";
    }
  },
  timeLeft: (language: Language) => {
    switch (language) {
      case "en":
        return "left";
      case "th":
        return "ที่เหลือ";
      default:
        return "left";
    }
  },
  calculating: (language: Language) => {
    switch (language) {
      case "en":
        return "Estimating time…";
      case "th":
        return "กำลังคำนวณเวลา…";
      default:
        return "Estimating time…";
    }
  },
  fileTooLarge: (language: Language) => {
    switch (language) {
      case "en":
        return "This video is larger than 2 GB. Compress it or trim it, then try again.";
      case "th":
        return "วิดีโอมีขนาดเกิน 2 GB กรุณาบีบอัดหรือตัดให้สั้นลงแล้วลองใหม่";
      default:
        return "This video is larger than 2 GB. Compress it or trim it, then try again.";
    }
  },
  notAVideo: (language: Language) => {
    switch (language) {
      case "en":
        return "That file isn't a video. Choose an MP4, MOV, or WebM file.";
      case "th":
        return "ไฟล์นี้ไม่ใช่วิดีโอ กรุณาเลือกไฟล์ MP4, MOV หรือ WebM";
      default:
        return "That file isn't a video. Choose an MP4, MOV, or WebM file.";
    }
  },
  uploadFailed: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload failed. Check your connection and try again.";
      case "th":
        return "อัปโหลดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";
      default:
        return "Upload failed. Check your connection and try again.";
    }
  },
  addQuestionAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Add question at";
      case "th":
        return "เพิ่มคำถามที่";
      default:
        return "Add question at";
    }
  },
  questionsHelper: (language: Language) => {
    switch (language) {
      case "en":
        return "Questions pop up in this order while students watch.";
      case "th":
        return "คำถามจะแสดงตามลำดับนี้ระหว่างที่นักเรียนดูวิดีโอ";
      default:
        return "Questions pop up in this order while students watch.";
    }
  },
  preventFastForwardHelper: (language: Language) => {
    switch (language) {
      case "en":
        return "Students can't skip ahead past parts they haven't watched.";
      case "th":
        return "นักเรียนจะข้ามไปส่วนที่ยังไม่ได้ดูไม่ได้";
      default:
        return "Students can't skip ahead past parts they haven't watched.";
    }
  },
  markCorrect: (language: Language) => {
    switch (language) {
      case "en":
        return "Mark as a correct answer";
      case "th":
        return "ตั้งเป็นคำตอบที่ถูก";
      default:
        return "Mark as a correct answer";
    }
  },
  correctHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Tick every correct answer.";
      case "th":
        return "ติ๊กทุกข้อที่เป็นคำตอบที่ถูก";
      default:
        return "Tick every correct answer.";
    }
  },
  editQuestionAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Question at";
      case "th":
        return "คำถามที่";
      default:
        return "Question at";
    }
  },
  useCurrentTime: (language: Language) => {
    switch (language) {
      case "en":
        return "Move to";
      case "th":
        return "ย้ายไปที่";
      default:
        return "Move to";
    }
  },
  cancel: (language: Language) => {
    switch (language) {
      case "en":
        return "Cancel";
      case "th":
        return "ยกเลิก";
      default:
        return "Cancel";
    }
  },
  edit: (language: Language) => {
    switch (language) {
      case "en":
        return "Edit question";
      case "th":
        return "แก้ไขคำถาม";
      default:
        return "Edit question";
    }
  },
  remove: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete question";
      case "th":
        return "ลบคำถาม";
      default:
        return "Delete question";
    }
  },
  removeOption: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove option";
      case "th":
        return "ลบตัวเลือก";
      default:
        return "Remove option";
    }
  },
  deleteConfirm: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete this question?";
      case "th":
        return "ลบคำถามนี้หรือไม่?";
      default:
        return "Delete this question?";
    }
  },
  jumpTo: (language: Language) => {
    switch (language) {
      case "en":
        return "Jump to";
      case "th":
        return "ข้ามไปที่";
      default:
        return "Jump to";
    }
  },
  needCorrect: (language: Language) => {
    switch (language) {
      case "en":
        return "Mark at least one correct answer.";
      case "th":
        return "เลือกคำตอบที่ถูกอย่างน้อย 1 ข้อ";
      default:
        return "Mark at least one correct answer.";
    }
  },
  needOptions: (language: Language) => {
    switch (language) {
      case "en":
        return "Fill in every option or remove the empty ones.";
      case "th":
        return "กรอกตัวเลือกให้ครบ หรือลบช่องที่ว่าง";
      default:
        return "Fill in every option or remove the empty ones.";
    }
  },
  saving: (language: Language) => {
    switch (language) {
      case "en":
        return "Saving…";
      case "th":
        return "กำลังบันทึก…";
      default:
        return "Saving…";
    }
  },
  saveFailed: (language: Language) => {
    switch (language) {
      case "en":
        return "Couldn't save the question. Check your connection and try again.";
      case "th":
        return "บันทึกคำถามไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";
      default:
        return "Couldn't save the question. Check your connection and try again.";
    }
  },
  sourceUpload: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload a file";
      case "th":
        return "อัปโหลดไฟล์";
      default:
        return "Upload a file";
    }
  },
  sourceYouTube: (language: Language) => {
    switch (language) {
      case "en":
        return "YouTube link";
      case "th":
        return "ลิงก์ YouTube";
      default:
        return "YouTube link";
    }
  },
  youTubeLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "YouTube video link";
      case "th":
        return "ลิงก์วิดีโอ YouTube";
      default:
        return "YouTube video link";
    }
  },
  youTubePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Paste a link like https://youtu.be/…";
      case "th":
        return "วางลิงก์ เช่น https://youtu.be/…";
      default:
        return "Paste a link like https://youtu.be/…";
    }
  },
  useThisVideo: (language: Language) => {
    switch (language) {
      case "en":
        return "Use this video";
      case "th":
        return "ใช้วิดีโอนี้";
      default:
        return "Use this video";
    }
  },
  notYouTubeLink: (language: Language) => {
    switch (language) {
      case "en":
        return "This isn't a link to a YouTube video. Copy it from the video's Share button.";
      case "th":
        return "ลิงก์นี้ไม่ใช่ลิงก์วิดีโอ YouTube กรุณาคัดลอกจากปุ่มแชร์ของวิดีโอ";
      default:
        return "This isn't a link to a YouTube video. Copy it from the video's Share button.";
    }
  },
  changeVideo: (language: Language) => {
    switch (language) {
      case "en":
        return "Change video";
      case "th":
        return "เปลี่ยนวิดีโอ";
      default:
        return "Change video";
    }
  },
  howToTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "How to add a YouTube video";
      case "th":
        return "วิธีเพิ่มวิดีโอจาก YouTube";
      default:
        return "How to add a YouTube video";
    }
  },
  howToStep1: (language: Language) => {
    switch (language) {
      case "en":
        return "Open the video on YouTube, click Share, then Copy.";
      case "th":
        return "เปิดวิดีโอใน YouTube กดปุ่มแชร์ แล้วกดคัดลอก";
      default:
        return "Open the video on YouTube, click Share, then Copy.";
    }
  },
  howToStep2: (language: Language) => {
    switch (language) {
      case "en":
        return "Make sure the video is Public or Unlisted. Private videos won't play for students.";
      case "th":
        return "ตรวจสอบว่าวิดีโอตั้งเป็นสาธารณะหรือไม่เป็นสาธารณะ (Unlisted) วิดีโอส่วนตัวจะเล่นให้นักเรียนไม่ได้";
      default:
        return "Make sure the video is Public or Unlisted. Private videos won't play for students.";
    }
  },
  howToStep3: (language: Language) => {
    switch (language) {
      case "en":
        return "Paste the link above and click Use this video.";
      case "th":
        return "วางลิงก์ด้านบนแล้วกด ใช้วิดีโอนี้";
      default:
        return "Paste the link above and click Use this video.";
    }
  },
  howToStep4: (language: Language) => {
    switch (language) {
      case "en":
        return "Play the video here, pause where you want a question, and click Add question.";
      case "th":
        return "เล่นวิดีโอที่นี่ หยุดตรงที่ต้องการถามแล้วกด เพิ่มคำถาม";
      default:
        return "Play the video here, pause where you want a question, and click Add question.";
    }
  },
  goodToKnow: (language: Language) => {
    switch (language) {
      case "en":
        return "Good to know";
      case "th":
        return "ข้อควรรู้";
      default:
        return "Good to know";
    }
  },
  noteControls: (language: Language) => {
    switch (language) {
      case "en":
        return "Students watch inside Tatuga with Tatuga's controls, so questions pop up on time and Prevent fast forward still works.";
      case "th":
        return "นักเรียนดูวิดีโอใน Tatuga ด้วยปุ่มควบคุมของ Tatuga คำถามจึงขึ้นตรงเวลา และการห้ามกรอวิดีโอยังใช้ได้";
      default:
        return "Students watch inside Tatuga with Tatuga's controls, so questions pop up on time and Prevent fast forward still works.";
    }
  },
  noteAds: (language: Language) => {
    switch (language) {
      case "en":
        return "YouTube may show ads to students before or during the video.";
      case "th":
        return "YouTube อาจแสดงโฆษณาให้นักเรียนก่อนหรือระหว่างวิดีโอ";
      default:
        return "YouTube may show ads to students before or during the video.";
    }
  },
  noteAvailability: (language: Language) => {
    switch (language) {
      case "en":
        return "If the owner deletes the video, makes it private, or turns off embedding, students can't watch it. Upload your own file if you need it to always work.";
      case "th":
        return "ถ้าเจ้าของลบวิดีโอ ตั้งเป็นส่วนตัว หรือปิดการฝัง นักเรียนจะดูไม่ได้ หากต้องการให้ใช้ได้เสมอ ให้อัปโหลดไฟล์ของคุณเอง";
      default:
        return "If the owner deletes the video, makes it private, or turns off embedding, students can't watch it. Upload your own file if you need it to always work.";
    }
  },
  ytEmbedBlocked: (language: Language) => {
    switch (language) {
      case "en":
        return "This video can't play outside YouTube. The owner may have turned off embedding, or it's private or removed. Choose another video or upload the file.";
      case "th":
        return "วิดีโอนี้เล่นนอก YouTube ไม่ได้ เจ้าของอาจปิดการฝัง หรือวิดีโอเป็นส่วนตัวหรือถูกลบ กรุณาเลือกวิดีโออื่นหรืออัปโหลดไฟล์";
      default:
        return "This video can't play outside YouTube. The owner may have turned off embedding, or it's private or removed. Choose another video or upload the file.";
    }
  },
  ytNotFound: (language: Language) => {
    switch (language) {
      case "en":
        return "This video is private, deleted, or the link is wrong. Set it to Public or Unlisted on YouTube, or choose another video.";
      case "th":
        return "วิดีโอนี้เป็นส่วนตัว ถูกลบ หรือลิงก์ไม่ถูกต้อง กรุณาตั้งเป็นสาธารณะหรือไม่เป็นสาธารณะใน YouTube หรือเลือกวิดีโออื่น";
      default:
        return "This video is private, deleted, or the link is wrong. Set it to Public or Unlisted on YouTube, or choose another video.";
    }
  },
  ytOther: (language: Language) => {
    switch (language) {
      case "en":
        return "YouTube couldn't play this video here. Reload the page, or choose another video.";
      case "th":
        return "YouTube เล่นวิดีโอนี้ที่นี่ไม่ได้ ลองโหลดหน้าใหม่ หรือเลือกวิดีโออื่น";
      default:
        return "YouTube couldn't play this video here. Reload the page, or choose another video.";
    }
  },
  ytLoadFailed: (language: Language) => {
    switch (language) {
      case "en":
        return "The YouTube player didn't load. Check your connection, or whether your school network blocks YouTube.";
      case "th":
        return "โหลดตัวเล่น YouTube ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต หรือเครือข่ายของโรงเรียนอาจบล็อก YouTube";
      default:
        return "The YouTube player didn't load. Check your connection, or whether your school network blocks YouTube.";
    }
  },
  linkSaveFailed: (language: Language) => {
    switch (language) {
      case "en":
        return "Couldn't save the link. Check your connection and try again.";
      case "th":
        return "บันทึกลิงก์ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";
      default:
        return "Couldn't save the link. Check your connection and try again.";
    }
  },
  fromYouTube: (language: Language) => {
    switch (language) {
      case "en":
        return "Playing from YouTube";
      case "th":
        return "เล่นจาก YouTube";
      default:
        return "Playing from YouTube";
    }
  },
  openOnYouTube: (language: Language) => {
    switch (language) {
      case "en":
        return "Open on YouTube";
      case "th":
        return "เปิดใน YouTube";
      default:
        return "Open on YouTube";
    }
  },
} as const;
