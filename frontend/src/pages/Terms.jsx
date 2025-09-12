import React from 'react';

const Terms = () => {
  return (
    <div className="md:mx-10 mx-4 my-10">
      <div className="text-center text-2xl pt-10 text-[#707070]">
        <p>TERMS & <span className="text-gray-700 font-semibold">CONDITIONS</span></p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <div className="flex flex-col justify-center gap-6 text-sm text-gray-600">
          <p className="text-center mt-2 text-gray-500">Last updated: June 1, 2024</p>

          <section className="my-10 space-y-6">
            <p>
              Welcome to Sanjivni. By accessing or using our Service, you agree to be bound by these Terms and Conditions. Please read these terms carefully before using our platform.
            </p>

            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Sanjivni's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
            </p>

            <h2 className="text-lg font-semibold">2. Medical Disclaimer</h2>
            <p>
              The information provided through our Service is for general informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with questions about your medical condition.
            </p>

            <h2 className="text-lg font-semibold">3. User Accounts</h2>
            <ul className="list-disc pl-6">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must immediately notify us of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>

            <h2 className="text-lg font-semibold">4. Appointment Booking</h2>
            <p>
              When booking appointments through our platform:
            </p>
            <ul className="list-disc pl-6">
              <li>You agree to provide accurate booking information</li>
              <li>You must attend scheduled appointments or cancel within the specified timeframe</li>
              <li>Cancellation policies may vary by healthcare provider</li>
              <li>We are not responsible for the quality of medical services provided</li>
            </ul>

            <h2 className="text-lg font-semibold">5. Prescription Services</h2>
            <p>
              Our prescription management services are subject to the following conditions:
            </p>
            <ul className="list-disc pl-6">
              <li>All prescriptions must be legally valid and issued by licensed healthcare providers</li>
              <li>Users must provide accurate prescription information</li>
              <li>We do not guarantee the availability of prescribed medications</li>
              <li>Users must comply with all applicable laws regarding prescription medications</li>
            </ul>

            <h2 className="text-lg font-semibold">6. Payment Terms</h2>
            <p>
              By using our paid services:
            </p>
            <ul className="list-disc pl-6">
              <li>You agree to pay all fees and charges associated with your use of the Service</li>
              <li>All payments must be made through our approved payment methods</li>
              <li>Fees are non-refundable unless otherwise specified</li>
              <li>We reserve the right to modify our fees with prior notice</li>
            </ul>

            <h2 className="text-lg font-semibold">7. Intellectual Property</h2>
            <p>
              All content and materials available on Sanjivani AI are protected by intellectual property rights. You may not use, reproduce, or distribute our content without authorization.
            </p>

            <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Sanjivani AI and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>

            <h2 className="text-lg font-semibold">9. Privacy</h2>
            <p>
              Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>

            <h2 className="text-lg font-semibold">10. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our Service.
            </p>

            <h2 className="text-lg font-semibold">Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
            <ul className="list-disc pl-6">
              <li>By email: support@sanjivani</li>
              <li>By visiting our contact page: <a href="./contact/" className="text-blue-500">Contact Us</a></li>
              <li>By phone: +91 90543 09266</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;