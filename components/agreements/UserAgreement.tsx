import React from "react";
import { useGetLanguage } from "../../react-query";

function UserAgreement() {
  const language = useGetLanguage();

  if (language.data === "th") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">ข้อตกลงผู้ใช้</h1>
        <p className="text-sm text-gray-500 mb-6">อัปเดตล่าสุด: 11/03/2025</p>

        <p className="mb-4">
          ยินดีต้อนรับสู่ TatugaSchool.com การเข้าถึงหรือใช้งานเว็บไซต์และบริการ
          ของเรา
          แสดงว่าคุณตกลงที่จะปฏิบัติตามและผูกพันตามข้อกำหนดและเงื่อนไขต่อไปนี้
          (&quot;ข้อตกลงผู้ใช้&quot;) โปรดตรวจสอบข้อตกลงอย่างละเอียด
          หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้
          คุณไม่ควรดำเนินการใช้งานแพลตฟอร์มของเราต่อไป
        </p>

        <h2 className="text-xl font-semibold mb-4">1. การยอมรับข้อกำหนด</h2>
        <p className="mb-4">
          โดยการสร้างบัญชีบน TatugaSchool.com
          คุณยอมรับข้อกำหนดในการให้บริการเหล่านี้ และรับทราบว่าคุณได้อ่าน เข้าใจ
          และยอมรับข้อตกลงนี้แล้ว
        </p>

        <h2 className="text-xl font-semibold mb-4">2. ข้อมูลบัญชีผู้ใช้</h2>
        <p className="mb-4">
          ในการใช้คุณสมบัติบางอย่างของเว็บไซต์
          คุณต้องสร้างบัญชีและให้ข้อมูลต่อไปนี้:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>ชื่อจริง</li>
          <li>นามสกุล</li>
          <li>ที่อยู่อีเมล</li>
          <li>หมายเลขโทรศัพท์</li>
        </ul>
        <p className="mb-4">โดยการให้ข้อมูลนี้ คุณ:</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            ยืนยันว่ารายละเอียดที่คุณให้เป็นข้อมูลที่ถูกต้อง เป็นปัจจุบัน
            และสมบูรณ์
          </li>
          <li>ตกลงที่จะรักษาข้อมูลนี้ให้เป็นปัจจุบัน</li>
          <li>
            รับทราบว่าการไม่รักษาข้อมูลที่ถูกต้องอาจส่งผลให้บัญชีของคุณถูกระงับหรือยกเลิก
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">
          3. ความเป็นส่วนตัวและการเก็บรวบรวมข้อมูล
        </h2>
        <p className="mb-4">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ ข้อมูลส่วนบุคคลที่คุณให้
          (ชื่อจริง นามสกุล อีเมล หมายเลขโทรศัพท์)
          ถูกเก็บรวบรวมเพื่อวัตถุประสงค์ในการระบุผู้ใช้ การสื่อสาร
          และการปรับปรุงประสบการณ์ของคุณบน TatugaSchool.com
          สำหรับรายละเอียดเพิ่มเติมเกี่ยวกับวิธีที่เราจัดการข้อมูลของคุณ
          โปรดดูที่{" "}
          <a href="#" className="text-blue-500 hover:underline">
            นโยบายความเป็นส่วนตัวของเรา
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mb-4">4. ความปลอดภัยของบัญชี</h2>
        <p className="mb-4">
          คุณมีหน้าที่รับผิดชอบในการรักษาความลับของข้อมูลประจำตัวบัญชีของคุณ
          (ชื่อผู้ใช้และรหัสผ่าน) และกิจกรรมใดๆ ที่เกิดขึ้นภายใต้บัญชีของคุณ
          TatugaSchool.com จะไม่รับผิดชอบต่อการสูญเสียหรือความเสียหายใดๆ
          ที่เกิดขึ้นจากการที่คุณไม่ปกป้องข้อมูลบัญชีของคุณ
        </p>

        <h2 className="text-xl font-semibold mb-4">5. การใช้งานที่ยอมรับได้</h2>
        <p className="mb-4">โดยการใช้ TatugaSchool.com คุณตกลงที่จะ:</p>
        <ul className="list-disc list-inside mb-4">
          <li>ใช้แพลตฟอร์มเพื่อวัตถุประสงค์ที่กำหนดไว้เท่านั้น</li>
          <li>
            ไม่กระทำการใดๆ ที่ผิดกฎหมาย
            หรือการกระทำที่อาจเป็นอันตรายต่อแพลตฟอร์มหรือผู้ใช้
          </li>
        </ul>
        <p className="mb-4">
          TatugaSchool.com
          ขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อตกลงนี้
          หรือกระทำการที่ต้องห้าม
        </p>

        <h2 className="text-xl font-semibold mb-4">6. การยกเลิก</h2>
        <p className="mb-4">
          TatugaSchool.com
          ขอสงวนสิทธิ์ในการยกเลิกหรือระงับบัญชีของคุณตามดุลยพินิจของเรา
          โดยมีหรือไม่มีการแจ้งให้ทราบล่วงหน้า ด้วยเหตุผลใดก็ตาม
          รวมถึงการละเมิดข้อกำหนดเหล่านี้
        </p>

        <h2 className="text-xl font-semibold mb-4">7. การเปลี่ยนแปลงข้อตกลง</h2>
        <p className="mb-4">
          TatugaSchool.com อาจแก้ไขหรือปรับปรุงข้อตกลงผู้ใช้นี้เป็นครั้งคราว
          การใช้งานเว็บไซต์อย่างต่อเนื่องหลังจากมีการเปลี่ยนแปลงดังกล่าว
          ถือเป็นการยอมรับข้อกำหนดที่ปรับปรุงแล้ว โปรดตรวจสอบข้อตกลงนี้เป็นระยะ
        </p>

        <h2 className="text-xl font-semibold mb-4">8. ข้อมูลการติดต่อ</h2>
        <p className="mb-4">
          สำหรับคำถามใดๆ เกี่ยวกับข้อตกลงผู้ใช้นี้ คุณสามารถติดต่อเราได้ที่{" "}
          <a
            href="mailto:permlap@tatugacamp.com"
            className="text-blue-500 hover:underline"
          >
            permlap@tatugacamp.com
          </a>
          .
        </p>

        <p className="text-center mt-8 text-sm text-gray-600">
          โดยการลงทะเบียนบัญชี คุณรับทราบว่าคุณได้อ่าน เข้าใจ
          และตกลงที่จะผูกพันตามข้อตกลงผู้ใช้นี้
        </p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6 ">
      <h1 className="text-3xl font-bold text-center mb-6">User Agreement</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: 11/03/2025</p>

      <p className="mb-4">
        Welcome to TatugaSchool.com. By accessing or using our website and
        services, you agree to comply with and be bound by the following terms
        and conditions (the &quot;User Agreement&quot;). Please review the
        agreement carefully. If you do not agree to these terms, you should not
        proceed with the use of our platform.
      </p>

      <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By creating an account on TatugaSchool.com, you agree to these terms of
        service and acknowledge that you have read, understood, and accepted the
        agreement.
      </p>

      <h2 className="text-xl font-semibold mb-4">
        2. User Account Information
      </h2>
      <p className="mb-4">
        To use certain features of the website, you must create an account and
        provide the following information:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>First Name</li>
        <li>Last Name</li>
        <li>Email Address</li>
        <li>Phone Number</li>
      </ul>
      <p className="mb-4">By providing this information, you:</p>
      <ul className="list-disc list-inside mb-4">
        <li>
          Confirm that the details you provide are accurate, current, and
          complete.
        </li>
        <li>Agree to keep this information up to date.</li>
        <li>
          Acknowledge that failure to maintain accurate information may result
          in the suspension or termination of your account.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-4">
        3. Privacy and Data Collection
      </h2>
      <p className="mb-4">
        We take your privacy seriously. The personal information you provide
        (first name, last name, email, phone number) is collected for the
        purpose of user identification, communication, and improving your
        experience on TatugaSchool.com. For more details on how we handle your
        information, please refer to our{" "}
        <a href="#" className="text-blue-500 hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mb-4">4. Account Security</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account
        credentials (username and password) and for any activities that occur
        under your account. TatugaSchool.com will not be liable for any loss or
        damage arising from your failure to protect your account information.
      </p>

      <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
      <p className="mb-4">By using TatugaSchool.com, you agree to:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Use the platform solely for its intended purposes.</li>
        <li>
          Not engage in any illegal activities or actions that could harm the
          platform or its users.
        </li>
      </ul>
      <p className="mb-4">
        TatugaSchool.com reserves the right to suspend or terminate accounts
        that violate this agreement or engage in prohibited activities.
      </p>

      <h2 className="text-xl font-semibold mb-4">6. Termination</h2>
      <p className="mb-4">
        TatugaSchool.com reserves the right to terminate or suspend your account
        at our discretion, with or without notice, for any reason, including
        violation of these terms.
      </p>

      <h2 className="text-xl font-semibold mb-4">
        7. Changes to the Agreement
      </h2>
      <p className="mb-4">
        TatugaSchool.com may modify or update this User Agreement from time to
        time. Continued use of the website following such changes constitutes
        acceptance of the updated terms. Please review this agreement
        periodically.
      </p>

      <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
      <p className="mb-4">
        For any questions regarding this User Agreement, you may contact us at{" "}
        <a
          href="mailto:permlap@tatugacamp.com"
          className="text-blue-500 hover:underline"
        >
          permlap@tatugacamp.com
        </a>
        .
      </p>

      <p className="text-center mt-8 text-sm text-gray-600">
        By signing up for an account, you acknowledge that you have read,
        understood, and agree to be bound by this User Agreement.
      </p>
    </div>
  );
}

export default UserAgreement;
