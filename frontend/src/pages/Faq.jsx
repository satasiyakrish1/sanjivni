import React, { useState } from 'react';
import SEO from '../components/SEO';

const faqs = [
  {
    question: 'What is Sanjivni?',
    answer: 'Sanjivani is an AI-powered herbal remedy finder that suggests natural and Ayurvedic remedies based on your symptoms, combining traditional herbal wisdom with modern AI.'
  },
  {
    question: 'How does Sanjivani work?',
    answer: 'Enter your symptoms and our AI analyzes them to recommend safe, effective herbal and Ayurveda-based remedies tailored to your needs. We also provide usage tips and cautions where applicable.'
  },
  {
    question: 'Is Sanjivani a substitute for a doctor?',
    answer: 'No. Sanjivani is for educational purposes and general wellness guidance. It is not a medical diagnosis tool. Always consult a qualified healthcare professional for serious or persistent conditions.'
  },
  {
    question: 'Are the remedies safe for everyone?',
    answer: 'Herbal remedies may interact with medications or not be suitable for certain conditions (e.g., pregnancy, chronic illnesses). Review cautions and consult your doctor if unsure before using any remedy.'
  },
  {
    question: 'Which symptoms does Sanjivani support?',
    answer: 'Common everyday issues such as cough, cold, sore throat, indigestion, mild headaches, skin concerns and more. We are continuously expanding coverage.'
  },
  {
    question: 'Is my data private?',
    answer: 'We only process the inputs needed to generate suggestions and follow industry-standard security practices. Avoid sharing personally identifiable or sensitive medical information.'
  },
  {
    question: 'Is Sanjivani free to use?',
    answer: 'Yes, core features are free. Some advanced features may require verification or future premium plans.'
  },
  {
    question: 'How accurate are the recommendations?',
    answer: 'We blend curated herbal knowledge with AI to provide helpful suggestions. Accuracy can vary by individual and context. Treat results as guidance, not a diagnosis.'
  },
  {
    question: 'Can I use Ayurvedic and home remedies together?',
    answer: 'Many remedies are compatible, but avoid combining overlapping herbs or exceeding recommended amounts. If you take prescription medicines or have conditions, consult a doctor first.'
  },
  {
    question: 'How can I contact support?',
    answer: 'Visit the Contact page for options or email us at the address listed there. We are happy to help.'
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <>
      <SEO
        title="FAQ – Sanjivni"
        description="Answers to common questions about Sanjivni, the AI-powered herbal and Ayurvedic remedy finder for safe, effective, and natural wellness guidance."
        canonicalUrl="/faq"
      >
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </SEO>

      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-10 text-center">Find answers about using Sanjivani for AI-powered herbal and Ayurvedic remedies.</p>
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
    </>
  );
};

export default Faq; 