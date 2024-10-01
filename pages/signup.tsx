import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpForm } from "@/components/auth/SignUpForm";

function SignUpPage() {
  return (
    <AuthLayout>
      <AuthHeader />

      <SignUpForm />

      <AuthFooter />
    </AuthLayout>
  );
}

export default SignUpPage;
