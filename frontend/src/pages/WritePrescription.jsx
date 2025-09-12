import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import SEO from '../components/SEO';

const WritePrescription = () => {
  return (
    <div className="py-8">
      <SEO 
        title="Write Prescription - Create Digital Medical Prescriptions | Prescripto"
        description="Create and generate professional medical prescriptions with our easy-to-use digital prescription tool. Add patient details, medicines, and dosage instructions."
        keywords="prescription, digital prescription, medical prescription, doctor prescription, medicine prescription"
        canonicalUrl="/write-prescription"
      />
      <PrescriptionForm />
    </div>
  );
};

export default WritePrescription;