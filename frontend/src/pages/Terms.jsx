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
              Welcome to Sanjivni – your trusted digital healthcare companion. By using our platform and services, you agree to follow the terms outlined below. Please read them carefully.
            </p>

            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Sanjivni's services, you confirm that you have read, understood, and agreed to these Terms & Conditions. If you do not agree, please stop using our services.
            </p>

            <h2 className="text-lg font-semibold">2. Medical Disclaimer</h2>
            <ul className="list-disc pl-6">
              <li>Sanjivni provides health information and AI-guided herbal/home remedies only for general awareness.</li>
              <li>We are not a substitute for doctors or qualified healthcare providers.</li>
              <li>Always consult a licensed medical professional before making healthcare decisions.</li>
              <li>Sanjivni is not responsible for medical emergencies or professional treatment delays.</li>
            </ul>

            <h2 className="text-lg font-semibold">3. User Accounts</h2>
            <p>When creating and using your account:</p>
            <ul className="list-disc pl-6">
              <li>You must provide true and complete information.</li>
              <li>You are responsible for keeping your account credentials private.</li>
              <li>Report any unauthorized use of your account immediately.</li>
              <li>Sanjivni reserves the right to suspend or terminate accounts that break our rules.</li>
            </ul>

            <h2 className="text-lg font-semibold">4. Appointment Booking</h2>
            <ul className="list-disc pl-6">
              <li>When booking with doctors or healthcare providers, you agree to provide accurate details.</li>
              <li>Please attend your appointments or cancel on time.</li>
              <li>Cancellation rules may differ depending on the provider.</li>
              <li>Sanjivni only facilitates bookings and is not responsible for the quality of medical services provided by third parties.</li>
            </ul>

            <h2 className="text-lg font-semibold">5. Prescription & Medicine Services</h2>
            <ul className="list-disc pl-6">
              <li>All prescriptions must be valid and issued by licensed doctors.</li>
              <li>You must provide accurate details when uploading or requesting prescriptions.</li>
              <li>We do not guarantee that all medicines will be available.</li>
              <li>You are fully responsible for following laws regarding prescription medicines.</li>
            </ul>

            <h2 className="text-lg font-semibold">6. Payments & Refunds</h2>
            <ul className="list-disc pl-6">
              <li>By using paid services, you agree to pay the fees shown at the time of booking/purchase.</li>
              <li>Payments are accepted only through approved methods.</li>
              <li>Fees are non-refundable, unless stated otherwise in writing.</li>
              <li>Sanjivni may update its pricing, but we will notify users before changes take effect.</li>
            </ul>

            <h2 className="text-lg font-semibold">7. Intellectual Property</h2>
            <ul className="list-disc pl-6">
              <li>All content on Sanjivni (logos, text, designs, AI models, and other materials) belongs to Sanjivni AI.</li>
              <li>You cannot copy, reuse, or distribute our content without written permission.</li>
            </ul>

            <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
            <ul className="list-disc pl-6">
              <li>Sanjivni is not responsible for losses, damages, or risks that arise from using our platform.</li>
              <li>We are not liable for any indirect, incidental, or special damages (such as missed appointments, wrong information usage, or medical misinterpretation).</li>
            </ul>

            <h2 className="text-lg font-semibold">9. Privacy</h2>
            <ul className="list-disc pl-6">
              <li>Your use of Sanjivni is also governed by our Privacy Policy.</li>
              <li>We explain in detail how your personal and medical data is collected, used, and protected.</li>
            </ul>

            <h2 className="text-lg font-semibold">10. Updates to Terms</h2>
            <ul className="list-disc pl-6">
              <li>Sanjivni may update these Terms & Conditions at any time.</li>
              <li>Important changes will be shared via email or app notifications.</li>
              <li>Continuing to use our services after updates means you accept the new Terms.</li>
            </ul>

            <h2 className="text-lg font-semibold">11. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of India. Any disputes will be handled under the jurisdiction of courts in India.
            </p>

            <h2 className="text-lg font-semibold">12. Contact Us</h2>
            <p>For any questions, feedback, or concerns, you can reach us at:</p>
            <ul className="list-disc pl-6">
              <li>📧 Email: support@sanjivni.com</li>
              <li>📞 Phone: +91 90543 09266</li>
              <li>🌐 Website Contact Page: <a href="/contact" className="text-blue-500 hover:underline">Contact Us</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;