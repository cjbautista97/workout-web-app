import { WorkoutTemplate, AppData, WorkoutType, generateId } from '../data';
import { useMemo, useState } from 'react';

const sections: { type: WorkoutType; label: string }[] = [
  { type: 'running', label: 'Running' },
  { type: 'weights', label: 'Weights' },
];

interface Props {
  data: AppData;
  setData: (data: AppData) => void;
}

export function WorkoutLibraryView({ data, setData }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const templatesByType = useMemo(() => {
    return sections.reduce<Record<WorkoutType, WorkoutTemplate[]>>((acc, section) => {
      acc[section.type] = data.templates.filter((template) => template.type === section.type);
      return acc;
    }, { running: [], weights: [] });
  }, [data.templates]);

  const handleDelete = (id: string) => {
    setData({
      ...data,
      templates: data.templates.filter((template) => template.id !== id),
    });
  };

  const handleSave = (template: WorkoutTemplate) => {
    if (editingId) {
      setData({
        ...data,
        templates: data.templates.map((item) => (item.id === template.id ? template : item)),
      });
    } else {
      setData({
        ...data,
        templates: [...data.templates, { ...template, id: generateId() }],
      });
    }
    setEditingId(null);
  };

  const templateToEdit = data.templates.find((item) => item.id === editingId) ?? null;

  return (
    <div className="view-section">
      <h1>Workout Library</h1>

      {sections.map((section) => (
        <section key={section.type} className="library-section">
          <div className="section-header">
            <h2>{section.label}</h2>
            <button className="secondary-button" onClick={() => setEditingId(`new-${section.type}`)}>
              Add Template
            </button>
          </div>

          <div className="template-list">
            {templatesByType[section.type].length === 0 ? (
              <p className="empty-state">No templates yet.</p>
            ) : (
              templatesByType[section.type].map((template) => (
                <div key={template.id} className="template-card">
                  <div>
                    <div className="template-name">{template.name}</div>
                    {template.notes ? <div className="template-notes">{template.notes}</div> : null}
                  </div>
                  <div className="template-actions">
                    <button onClick={() => setEditingId(template.id)}>Edit</button>
                    <button className="secondary-button" onClick={() => handleDelete(template.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {editingId === `new-${section.type}` && (
            <TemplateForm
              initial={{ id: generateId(), type: section.type, name: '', notes: '' }}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          )}
        </section>
      ))}

      {templateToEdit ? (
        <TemplateForm initial={templateToEdit} onSave={handleSave} onCancel={() => setEditingId(null)} />
      ) : null}
    </div>
  );
}

interface FormProps {
  initial: WorkoutTemplate;
  onSave: (template: WorkoutTemplate) => void;
  onCancel: () => void;
}

function TemplateForm({ initial, onSave, onCancel }: FormProps) {
  const [name, setName] = useState(initial.name);
  const [notes, setNotes] = useState(initial.notes ?? '');

  return (
    <div className="card form-card">
      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <div className="form-actions">
        <button onClick={() => onSave({ ...initial, name: name.trim(), notes: notes.trim() || undefined })}>
          Save
        </button>
        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
