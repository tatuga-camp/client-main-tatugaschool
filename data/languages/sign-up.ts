import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const signUpLanguageData = {
  title: (language: Language) =>
    pick(language, "Create your teacher account", "สร้างบัญชีครู"),
  haveAccount: (language: Language) =>
    pick(language, "Already have an account?", "มีบัญชีอยู่แล้ว?"),
  signIn: (language: Language) => pick(language, "Sign in", "เข้าสู่ระบบ"),
  invitedTo: (language: Language) =>
    pick(language, "You're invited to join", "คุณได้รับคำเชิญให้เข้าร่วม"),
  invitationError: (language: Language) =>
    pick(
      language,
      "You can still create an account. Ask the school admin to send a new invitation afterwards.",
      "คุณยังสร้างบัญชีได้ตามปกติ แล้วขอให้ผู้ดูแลโรงเรียนส่งคำเชิญใหม่อีกครั้ง",
    ),
  googleConnected: (language: Language) =>
    pick(language, "Signing up with Google", "กำลังสมัครด้วย Google"),
  orEmail: (language: Language) =>
    pick(language, "or sign up with email", "หรือสมัครด้วยอีเมล"),
  firstNameTitle: (language: Language) =>
    pick(language, "First name", "ชื่อจริง"),
  firstNamePlaceholder: (language: Language) =>
    pick(language, "Somchai", "สมชาย"),
  lastNameTitle: (language: Language) => pick(language, "Last name", "นามสกุล"),
  lastNamePlaceholder: (language: Language) =>
    pick(language, "Jaidee", "ใจดี"),
  phone: (language: Language) =>
    pick(language, "Phone number", "เบอร์โทรศัพท์"),
  email: (language: Language) => pick(language, "Email", "อีเมล"),
  emailPlaceholder: (language: Language) =>
    pick(language, "you@school.ac.th", "you@school.ac.th"),
  emailHint: (language: Language) =>
    pick(
      language,
      "We'll send a verification link here.",
      "เราจะส่งลิงก์ยืนยันไปที่อีเมลนี้",
    ),
  password: (language: Language) => pick(language, "Password", "รหัสผ่าน"),
  passwordPlaceholder: (language: Language) =>
    pick(language, "Create a password", "ตั้งรหัสผ่าน"),
  confirmPassword: (language: Language) =>
    pick(language, "Confirm password", "ยืนยันรหัสผ่าน"),
  confirmPasswordPlaceholder: (language: Language) =>
    pick(language, "Type the password again", "พิมพ์รหัสผ่านอีกครั้ง"),
  ruleLength: (language: Language) =>
    pick(language, "At least 8 characters", "อย่างน้อย 8 ตัวอักษร"),
  ruleMatch: (language: Language) =>
    pick(language, "Both passwords match", "รหัสผ่านทั้งสองช่องตรงกัน"),
  required: (language: Language) =>
    pick(language, "Fill in this field", "กรุณากรอกช่องนี้"),
  invalidEmail: (language: Language) =>
    pick(
      language,
      "Enter an email address like name@school.ac.th",
      "กรอกอีเมลให้ถูกรูปแบบ เช่น name@school.ac.th",
    ),
  invalidPhone: (language: Language) =>
    pick(language, "Enter your phone number", "กรอกเบอร์โทรศัพท์"),
  passwordTooShort: (language: Language) =>
    pick(
      language,
      "Use at least 8 characters",
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    ),
  passwordMismatch: (language: Language) =>
    pick(
      language,
      "The passwords don't match",
      "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
    ),
  turnstileRequired: (language: Language) =>
    pick(
      language,
      "Complete the security check above the button",
      "กรุณายืนยันการตรวจสอบความปลอดภัยด้านบนปุ่ม",
    ),
  agreeRequired: (language: Language) =>
    pick(
      language,
      "Agree to the Terms of Service and Privacy Policy to continue",
      "กรุณายอมรับข้อตกลงการใช้บริการและนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ",
    ),
  agreePrefix: (language: Language) =>
    pick(language, "I agree to the", "ฉันยอมรับ"),
  agreeJoin: (language: Language) => pick(language, "and", "และ"),
  termsOfService: (language: Language) =>
    pick(language, "Terms of Service", "ข้อตกลงการใช้บริการ"),
  privacyPolicy: (language: Language) =>
    pick(language, "Privacy Policy", "นโยบายความเป็นส่วนตัว"),
  close: (language: Language) => pick(language, "Close", "ปิด"),
  createAccount: (language: Language) =>
    pick(language, "Create account", "สร้างบัญชี"),
  creatingAccount: (language: Language) =>
    pick(language, "Creating account…", "กำลังสร้างบัญชี…"),
  createAccountGoogle: (language: Language) =>
    pick(language, "Continue with Google", "ดำเนินการต่อด้วย Google"),
  journeyTitle: (language: Language) =>
    pick(
      language,
      "Your school is three steps away",
      "อีกสามขั้นตอน โรงเรียนของคุณก็พร้อมใช้งาน",
    ),
  journeyInvitedTitle: (language: Language) =>
    pick(
      language,
      "Your school is waiting for you",
      "โรงเรียนของคุณรอคุณอยู่",
    ),
  stepAccount: (language: Language) =>
    pick(language, "Create your account", "สร้างบัญชีของคุณ"),
  stepAccountDetail: (language: Language) =>
    pick(
      language,
      "Your name, email, and a password. About a minute.",
      "ชื่อ อีเมล และรหัสผ่าน ใช้เวลาประมาณหนึ่งนาที",
    ),
  stepVerify: (language: Language) =>
    pick(language, "Verify your email", "ยืนยันอีเมล"),
  stepVerifyDetail: (language: Language) =>
    pick(
      language,
      "Open the link we send to your inbox.",
      "กดลิงก์ที่เราส่งไปที่กล่องจดหมายของคุณ",
    ),
  stepSchool: (language: Language) =>
    pick(language, "Set up your school", "ตั้งค่าโรงเรียน"),
  stepSchoolDetail: (language: Language) =>
    pick(
      language,
      "Add your school's logo and address, then invite other teachers.",
      "เพิ่มโลโก้และที่อยู่ของโรงเรียน แล้วเชิญครูท่านอื่นเข้าร่วม",
    ),
  stepJoin: (language: Language) =>
    pick(language, "Join your school", "เข้าร่วมโรงเรียน"),
  stepJoinDetail: (language: Language) =>
    pick(
      language,
      "You go straight to the school once your account is ready.",
      "เมื่อสร้างบัญชีเสร็จ คุณจะเข้าสู่โรงเรียนได้ทันที",
    ),
};
