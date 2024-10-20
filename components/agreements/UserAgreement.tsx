import React from "react";

function UserAgreement() {
  return (
    <div className="max-w-4xl mx-auto p-6 ">
      <h1 className="text-3xl font-bold text-center mb-6">User Agreement</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: 2/10/2024</p>

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
          href="mailto:support@tatugaschool.com"
          className="text-blue-500 hover:underline"
        >
          support@tatugaschool.com
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
