// pages/login.tsx
import React, { useState } from "react";
import styled from "styled-components";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // You can integrate your authentication logic here.
  };

  // Function to handle forgot password
  const handleForgotPassword = () => {
    console.log("Redirect to forgot password page");
    // You can implement navigation to the forget password page here.
  };

  // Function to handle sign-up
  const handleSignUp = () => {
    console.log("Redirect to sign-up page");
    // You can implement navigation to the sign-up page here.
  };

  return (
    <LoginContainer>
      <LogoSection>
        <img src="/logo.svg" alt="Tatuga School Logo" />
        <h1>Tatuga School</h1>
      </LogoSection>
      <LoginForm onSubmit={handleLogin}>
        <h2>Log in</h2>
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
        <ForgotPassword onClick={handleForgotPassword}>
          Forget password?
        </ForgotPassword>
        <LoginButton type="submit">Log in</LoginButton>
        <SignUpLink onClick={handleSignUp}>Sign up</SignUpLink>
      </LoginForm>
      <Footer>
        <img src="/logo-ted-fund.svg" alt="Logo ted fund" />
        <FooterText>
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </FooterText>
      </Footer>
    </LoginContainer>
  );
};

export default LoginPage;

// Styled-components
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f9;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center; /* Vertically align items */
  justify-content: center; /* Horizontally center the whole section */
  margin-bottom: 2rem;

  img {
    width: 60px;
    height: auto;
    margin-right: 1rem; /* Add some space between the logo and the text */
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const LoginForm = styled.form`
  background: white;
  padding: 80px 40px; /* Top: 80px, Right: 40px, Bottom: 80px, Left: 40px */
  border-radius: 40px; /* Rounded corners with 40px radius */
  box-shadow: 0px 12px 24px rgba(145, 158, 171, 0.12); /* Box shadow settings from the Figma */
  text-align: center;
  width: 600px; /* Fixed width */
  height: 628px; /* Fixed height */

  h2 {
    margin-bottom: 24px; /* Match gap between the title and inputs */
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

const ForgotPassword = styled.a`
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: #6e6e6e;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #5f3dc4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background-color: #482ab4;
  }
`;

const SignUpLink = styled.a`
  display: block;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6e6e6e;
  cursor: pointer;
`;

const Footer = styled.div`
  display: flex;
  align-items: center; /* Vertically align the image and the text */
  justify-content: center; /* Center the whole section horizontally */
  margin-top: 2rem;

  img {
    height: 40px;
    margin-right: 1rem; /* Space between the logo and text */
  }
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #6e6e6e;
  max-width: 507px;
  margin: 0;
  text-align: left; /* Align the text */
`;
