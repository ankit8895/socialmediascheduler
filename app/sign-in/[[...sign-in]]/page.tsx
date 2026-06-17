import { SignIn } from "@clerk/nextjs";

import React from "react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" />
    </div>
  );
};

export default SignInPage;
