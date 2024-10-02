import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className="w-full  flex-col  flex justify-center items-center gap-5">
        <AuthHeader />
        <LoginForm />
      </div>
      <AuthFooter />
    </AuthLayout>
  );
};

export default LoginPage;
