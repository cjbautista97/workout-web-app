import { WorkoutTemplate, AppData, WorkoutType, generateId } from '../data';
import { useMemo, useState } from 'react';

const runningPresets = ['Tempo Run', 'Easy Run', 'Long Run', 'Fartlek Run', 'Interval Run'] as const;
const weightPresets = ['Upper Body', 'Lower Body'] as const;

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
    const isNewTemplate = editingId?.startsWith('new-');

    if (isNewTemplate) {
      setData({
        ...data,
        templates: [...data.templates, { ...template, id: generateId() }],
      });
    } else {
      setData({
        ...data,
        templates: data.templates.map((item) => (item.id === template.id ? template : item)),
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
                    <div className="template-meta">
                      {template.tag ? <span className="template-tag">{template.tag}</span> : null}
                      {template.notes ? <span className="template-notes">{template.notes}</span> : null}
                    </div>
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
  const [tag, setTag] = useState(initial.tag ?? '');
  const [distanceMiles, setDistanceMiles] = useState(initial.distanceMiles?.toString() ?? '');
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes?.toString() ?? '');
  const [weightLbs, setWeightLbs] = useState(initial.weightLbs?.toString() ?? '');
  const [reps, setReps] = useState(initial.reps?.toString() ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');

  const isRunning = initial.type === 'running';
  const tagOptions = isRunning ? runningPresets : weightPresets;

  const handlePresetClick = (preset: string) => {
    setTag(preset);
  };

  return (
    <div className="card form-card">
      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <>
        <div className="form-row">
          <label>{isRunning ? 'Type of run' : 'Tag'}</label>
          <div className="preset-picker">
            {tagOptions.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-option ${tag === preset ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row form-row-split">
          {isRunning ? (
            <>
              <div>
                <label>Distance (mi)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={distanceMiles}
                  onChange={(event) => setDistanceMiles(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label>Time (minutes)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={weightLbs}
                  onChange={(event) => setWeightLbs(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label>Reps</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={reps}
                  onChange={(event) => setReps(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </>
          )}
        </div>
      </>

      <div className="form-row">
        <label>Notes</label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <div className="form-actions">
        <button
          onClick={() =>
            onSave({
              ...initial,
              name: name.trim(),
              tag: tag || undefined,
              distanceMiles: isRunning && distanceMiles ? parseFloat(distanceMiles) : undefined,
              durationMinutes: isRunning && durationMinutes ? parseInt(durationMinutes, 10) : undefined,
              weightLbs: !isRunning && weightLbs ? parseInt(weightLbs, 10) : undefined,
              reps: !isRunning && reps ? parseInt(reps, 10) : undefined,
              notes: notes.trim() || undefined,
            })
          }
        >
          Save
        </button>
        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
