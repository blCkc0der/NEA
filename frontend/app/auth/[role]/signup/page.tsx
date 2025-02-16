'use client';
import { useParams } from "next/navigation";
import { SignUpForm } from "@/app/components/SignUpForm";

export default function SignUpPage() {
    const params = useParams();
    const role = params.role as string;

    return (
        <SignUpForm 
            role={role} // Pass role to your form component
            onSuccessfulSignUp={() => {
                    //Add post-signup logic here
            }}/>
    );
}