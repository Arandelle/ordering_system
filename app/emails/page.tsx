import React from 'react'
import { VerificationEmail } from './VerificationEmail'



const page = () => {
  return (
    <div>
      <VerificationEmail  name='Arandelle Paguinto' verifyUrl={`${process.env.NEXT_PUBLIC_URL}/api/auth/customer/verify-email?token=NOTOKEN&email=Test@email.com`}/>
    </div>
  )
}

export default page
