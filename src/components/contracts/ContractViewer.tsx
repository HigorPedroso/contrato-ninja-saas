import { useActivity } from "@/hooks/useActivity";

// Inside your component
const { trackActivity } = useActivity();

// When downloading
const handleDownload = async () => {
  await trackActivity("download", contract.id, contract.name);
  // ... rest of download logic
};

// When viewing
useEffect(() => {
  trackActivity("view", contract.id, contract.name);
}, [contract.id]);

// When editing
const handleSave = async () => {
  await trackActivity("edit", contract.id, contract.name);
  // ... rest of save logic
};

// When creating
const handleCreate = async () => {
  await trackActivity("create", contract.id, contract.name);
  // ... rest of create logic
};