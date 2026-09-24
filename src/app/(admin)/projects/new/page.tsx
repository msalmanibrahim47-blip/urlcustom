import { CreateProjectForm } from '@/components/CreateProjectForm';

export default function NewProjectPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="font-semibold text-lg">Create Project</h2>
        <p className="text-sm text-muted">Paste a customer's website URL to start customizing it.</p>
      </div>
      <CreateProjectForm />
    </div>
  );
}
