import React from 'react';
import { assets } from '../assets/assets';

const Privacy = () => {
  return (
    <div className="md:mx-10 mx-4 my-10">
      <div className="text-center text-2xl pt-10 text-[#707070]">
        <p>Privacy Policy – <span className="text-gray-700 font-semibold">Sanjivni</span></p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <div className="flex flex-col justify-center gap-6 text-sm text-gray-600">
      <p className="text-center mt-2 text-gray-500">Last updated: September 12, 2025</p>

      <section className="my-10 space-y-6">
        <p>
          This Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your information when you use the Sanjivni Service. It also informs you about your privacy rights and how the law protects you.
        </p>
        <p>
          We use your personal data to provide and improve the Sanjivni Service. By using Sanjivni, you agree to the collection and use of information in accordance with this Privacy Policy. Our commitment is to protect your data responsibly, transparently, and in compliance with applicable laws and privacy standards.
        </p>

        <h2 className="text-lg font-semibold">Interpretation and Definitions</h2>
        <h3 className="font-semibold">Interpretation</h3>
        <p>
          Words with capitalized initial letters have meanings defined below. These definitions apply whether the terms appear in singular or plural.
        </p>

        <h3 className="font-semibold">Definitions</h3>
        <p><strong>Account</strong>: A unique account created for you to access Sanjivni or parts of the Service.</p>
        <p><strong>Company</strong> (referred to as “Sanjivni”, “We”, “Us” or “Our”).</p>
        <p><strong>Cookies</strong>: Small files placed on your device to store browsing history or activity.</p>
        <p><strong>Country</strong>: India.</p>
        <p><strong>Device</strong>: Any device that can access the Service, such as a computer, tablet, or smartphone.</p>
        <p><strong>Personal Data</strong>: Any information that identifies an individual.</p>
        <p><strong>Service</strong>: The Sanjivni platform (AI-based herbal remedy finder).</p>
        <p><strong>Service Provider</strong>: Any third-party company or individual engaged to support or analyze the Service.</p>
        <p><strong>Usage Data</strong>: Data collected automatically during Service use, including IP address, browser type, and device information.</p>
        <p><strong>You</strong>: The individual using the Sanjivni Service.</p>

        <h2 className="text-lg font-semibold">Collecting and Using Your Personal Data</h2>
        <h3 className="font-semibold">Types of Data Collected</h3>

        <h4 className="font-semibold">Personal Data</h4>
        <p>While using Sanjivni, we may collect the following personal information:</p>
        <ul className="list-disc pl-6">
          <li>Email address</li>
          <li>Name</li>
          <li>Phone number</li>
          <li>Location (City, State, Country)</li>
        </ul>

        <h4 className="font-semibold">Usage Data</h4>
        <p>Collected automatically and may include:</p>
        <ul className="list-disc pl-6">
          <li>IP address</li>
          <li>Browser details</li>
          <li>Device type</li>
          <li>Time and date of Service access</li>
          <li>Pages visited and activity</li>
        </ul>

        <h3 className="font-semibold">Tracking Technologies and Cookies</h3>
        <p>We use Cookies and similar technologies to track activity and store information:</p>
        <ul className="list-disc pl-6">
          <li><strong>Cookies</strong>: Small files placed on your device.</li>
          <li><strong>Flash Cookies</strong>: Local stored objects for preferences.</li>
          <li><strong>Web Beacons</strong>: Small electronic files to measure traffic and engagement.</li>
        </ul>

        <h3 className="font-semibold">Use of Your Personal Data</h3>
        <p>Sanjivni may use Personal Data for purposes such as:</p>
        <ul className="list-disc pl-6">
          <li>To provide and maintain the Service.</li>
          <li>To create and manage your Account.</li>
          <li>To communicate with you by email, SMS, or other channels.</li>
          <li>To send updates, offers, and relevant health-related information.</li>
          <li>To improve and personalize the Service.</li>
          <li>For analytics, business transfers, or legal compliance.</li>
        </ul>

        <h3 className="text-lg font-semibold">Retention of Your Data</h3>
        <p>We will retain your Personal Data only as long as necessary for the purposes outlined in this Privacy Policy.</p>

        <h3 className="text-lg font-semibold">Transfer of Data</h3>
        <p>Your information may be transferred and stored outside your region. Sanjivni ensures appropriate measures are taken to secure your data.</p>

        <h3 className="text-lg font-semibold">Disclosure of Data</h3>
        <ul className="list-disc pl-6">
          <li><strong>Business Transactions</strong>: In the case of a merger, acquisition, or sale, your data may be transferred.</li>
          <li><strong>Legal Requirements</strong>: Data may be disclosed to comply with laws, protect Sanjivni’s rights, or safeguard users.</li>
        </ul>

        <h3 className="text-lg font-semibold">Security of Data</h3>
        <p>We take reasonable steps to protect your Personal Data, but no system is 100% secure.</p>

        <h2 className="text-lg font-semibold">Children’s Privacy</h2>
        <p>Sanjivni does not knowingly collect information from children under the age of 13.</p>

        <h2 className="text-lg font-semibold">Links to Other Sites</h2>
        <p>Our Service may contain links to third-party websites. We are not responsible for their privacy practices and recommend reviewing their policies.</p>

        <h2 className="text-lg font-semibold">Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be communicated via our Service or by direct notice.</p>

        <h2 className="text-lg font-semibold">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, you may contact us:</p>
        <ul className="list-disc pl-6">
          <li>📧 Email: support@sanjivni.com</li>
          <li>📞 Phone: +91 90000 00000</li>
          <li>🌐 Website: <a href="https://sanjivni.vercel.app/" className="text-blue-500">sanjivni.vercel.app</a></li>
        </ul>
      </section>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
