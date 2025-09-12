import WardManagement from '../components/WardManagement';
import SEO from '../components/SEO';

const WardManagementPage = () => {
    return (
        <>
            <SEO title="Ward Management | Prescripto" description="Manage hospital wards, track bed availability, and handle emergency cases" />
            <div className="min-h-screen bg-gray-50">
                <WardManagement />
            </div>
        </>
    );
};

export default WardManagementPage;