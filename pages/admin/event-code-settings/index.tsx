import AdminClientPage from "@components/admin/AdminClientPage";
import EventCodeSettings from "@components/admin/EventcodeSettings";

const EventCodeSettingsPage: React.FC = () => {
  return (
    <AdminClientPage>
      <EventCodeSettings />
    </AdminClientPage>
  );
};

export default EventCodeSettingsPage;
