import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is Prescripto?',
    answer: 'Prescripto is a healthcare platform designed to streamline doctor appointments, prescriptions, and health management for patients and providers.'
  },
  {
    question: 'How do I book an appointment?',
    answer: 'Simply sign up or log in, search for your preferred doctor or speciality, and click on the "Book Appointment" button to schedule your visit.'
  },
  {
    question: 'Is my health data secure?',
    answer: 'Yes, we use industry-standard encryption and security practices to ensure your health data is safe and private.'
  },
  {
    question: 'Can I access my prescriptions online?',
    answer: 'Absolutely! All your prescriptions are stored securely in your account and can be accessed anytime from the dashboard.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach our support team via the Contact page or email us at support@prescripto.com.'
  },
  {
    question: 'Is Prescripto free to use?',
    answer: 'Prescripto offers both free and premium features. Basic appointment booking and prescription management are free for all users.'
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-primary mb-4 text-center">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-10 text-center">Find answers to the most common questions about using Prescripto.</p>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              className="w-full flex justify-between items-center px-6 py-4 text-lg font-medium text-left focus:outline-none focus:bg-blue-50 hover:bg-blue-50 transition"
              onClick={() => toggle(idx)}
              aria-expanded={openIndex === idx}
            >
              <span>{faq.question}</span>
              <span className={`ml-4 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 text-gray-700 animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq; 