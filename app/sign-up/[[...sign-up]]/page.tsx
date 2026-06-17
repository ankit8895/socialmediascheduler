import { SignUp } from "@clerk/nextjs";

import React from "react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
};

export default SignUpPage;
