"use client"

import { SignIn, SignUp } from "@clerk/nextjs"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const authAppearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-white border border-gray-200 shadow-sm rounded-lg p-6", // Clean card style
      headerTitle: "text-xl font-semibold text-gray-900 mb-2",
      headerSubtitle: "text-sm text-gray-600 mb-4",
      socialButtonsBlockButton:
        "w-full h-11 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-3",
      socialButtonsBlockButtonText: "text-gray-700 font-medium text-sm",
      socialButtonsBlockButtonArrow: "hidden",
      formButtonPrimary:
        "w-full h-11 bg-black text-white hover:bg-gray-800 rounded-md font-medium transition-all duration-200",
      formFieldInput:
        "w-full h-11 px-3 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all duration-200 bg-white text-sm",
      formFieldLabel: "text-sm font-medium text-gray-700 mb-1.5 block",
      footerActionLink:
        "text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 text-sm",
      dividerLine: "bg-gray-200",
      dividerText: "text-gray-500 text-sm font-normal px-4",
      formFieldInputShowPasswordButton:
        "text-gray-400 hover:text-gray-600 transition-colors duration-200",
      formFieldAction:
        "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200",
      identityPreviewEditButton:
        "text-blue-600 hover:text-blue-700 font-medium",
      formResendCodeLink:
        "text-blue-600 hover:text-blue-700 font-medium text-sm",
      otpCodeFieldInput:
        "border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md text-center w-10 h-10",
      footer: "hidden",
    },
    layout: {
      socialButtonsPlacement: "top" as "top",
      showOptionalFields: false,
    },
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-6">
          <div className="w-8 h-8 mx-auto">
            <svg viewBox="0 0 24 24" className="w-full h-full text-black">
              <path
                fill="currentColor"
                d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-normal text-black">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        </div>

        <div className="space-y-4">
          {isSignUp ? (
            <SignUp
              appearance={authAppearance}
            />
          ) : (
            <SignIn
              appearance={authAppearance}
            />
          )}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-600 hover:text-gray-900 font-normal p-0 h-auto hover:bg-transparent transition-colors duration-200 text-sm"
          >
            {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4">
          <div className="flex items-center justify-center space-x-4">
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">
              Terms of use
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
