import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => {

  return (
    <AuthLayout>
      <AuthHeader />
      <LoginForm />
      <AuthFooter />
    </AuthLayout>
  );
};

export default LoginPage;
