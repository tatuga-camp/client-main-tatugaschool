import { AuthFooter } from "@/components/auth/AuthFooter"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { ForgetPasswordForm } from "@/components/auth/ForgetPassword"

const ForgetPasswordPage = () => {
    return (
        <AuthLayout>
            <AuthHeader />
            <ForgetPasswordForm />
            <AuthFooter />
        </AuthLayout>
    )
}

export default ForgetPasswordPage