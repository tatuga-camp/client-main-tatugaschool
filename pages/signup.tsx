import React, { useState } from "react";
import styled from "styled-components";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle sign-up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบว่าผู้ใช้ได้กรอกข้อมูลในทุกช่องหรือไม่
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ตรวจสอบว่า password และ confirm password ตรงกันหรือไม่
    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // ถ้าไม่มีข้อผิดพลาด สามารถดำเนินการสมัครสมาชิกต่อได้
    setErrorMessage(""); // เคลียร์ข้อความแสดงข้อผิดพลาด
    console.log("Signing up with:", { name, email, password });
    // คุณสามารถเพิ่มการเรียกใช้ API สำหรับ sign-up logic ตรงนี้ได้
  };

  return (
    <SignUpContainer>
      <LogoSection>
        <img src="/logo.svg" alt="Tatuga School Logo" />
        <h1>Tatuga School</h1>
      </LogoSection>
      <SignUpForm onSubmit={handleSignUp}>
        <h2>Sign up</h2>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <SignUpButton type="submit">Sign up</SignUpButton>
      </SignUpForm>
      <Footer>
        <img src="/logo-ted-fund.svg" alt="Logo ted fund" />
        <FooterText>
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </FooterText>
      </Footer>
    </SignUpContainer>
  );
};

export default SignUpPage;

// Styled-components

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f9;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;

  img {
    width: 60px;
    height: auto;
    margin-right: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const SignUpForm = styled.form`
  background: white;
  padding: 80px 40px;
  border-radius: 40px;
  box-shadow: 0px 12px 24px rgba(145, 158, 171, 0.12);
  text-align: center;
  width: 600px;
  height: 628px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h2 {
    margin-bottom: 24px;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const SignUpButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #5f3dc4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #482ab4;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: -10px;
  font-size: 0.875rem;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  img {
    height: 40px;
    margin-right: 1rem;
  }
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #6e6e6e;
  max-width: 507px;
  margin: 0;
  text-align: left;
`;