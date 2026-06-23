import { useMemo, useState } from 'react';
import {
  AppData,
  RunLogEntry,
  WeightsLogEntry,
  WorkoutTemplate,
  getTodayDateString,
  generateId,
  WeightSet,
} from '../data';

interface Props {
  templateId: string;
  data: AppData;
  onSave: (entry: { type: 'running'; payload: RunLogEntry } | { type: 'weights'; payload: WeightsLogEntry }) => void;
  onClose: () => void;
}

export function LogWorkoutModal({ templateId, data, onSave, onClose }: Props) {
  const template = data.templates.find((item) => item.id === templateId);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [sets, setSets] = useState<WeightSet[]>([{ exercise: '', weightLbs: 0, reps: 0, rpe: 1 }]);

  if (!template) return null;

  const handleSetChange = (index: number, field: keyof WeightSet, value: string) => {
    const nextSets = [...sets];
    nextSets[index] = {
      ...nextSets[index],
      [field]: field === 'exercise' ? value : Number(value),
    };
    setSets(nextSets);
  };

  const addSet = () => setSets([...sets, { exercise: '', weightLbs: 0, reps: 0, rpe: 1 }]);
  const removeSet = (index: number) => setSets(sets.filter((_, i) => i !== index));

  const canSave = useMemo(() => {
    if (template.type === 'running') {
      return distanceMiles > 0 && durationMinutes > 0;
    }
    return sets.every((set) => set.exercise.trim() && set.weightLbs >= 0 && set.reps >= 0 && set.rpe >= 1 && set.rpe <= 10);
  }, [distanceMiles, durationMinutes, sets, template.type]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Log {template.name}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {template.type === 'running' ? (
          <div className="form-card">
            <div className="form-row">
              <label>Distance (miles)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={distanceMiles}
                onChange={(event) => setDistanceMiles(Math.max(0, Number(event.target.value)))}
              />
            </div>
            <div className="form-row">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Math.max(0, Number(event.target.value)))}
              />
            </div>
            <div className="form-actions">
              <button disabled={!canSave} onClick={() => onSave({ type: 'running', payload: { id: generateId(), templateId, date: getTodayDateString(), distanceMiles, durationMinutes } })}>
                Save Run Log
              </button>
            </div>
          </div>
        ) : (
          <div className="form-card">
            <div className="sets-header">
              <span>Sets</span>
              <button className="secondary-button" onClick={addSet} type="button">
                Add Set
              </button>
            </div>
            {sets.map((set, index) => (
              <div key={index} className="set-row">
                <input
                  type="text"
                  placeholder="Exercise"
                  value={set.exercise}
                  onChange={(event) => handleSetChange(index, 'exercise', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={set.weightLbs}
                  onChange={(event) => handleSetChange(index, 'weightLbs', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={set.reps}
                  onChange={(event) => handleSetChange(index, 'reps', event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={set.rpe}
                  onChange={(event) => handleSetChange(index, 'rpe', event.target.value)}
                />
                <button className="secondary-button" type="button" onClick={() => removeSet(index)}>
                  Remove
                </button>
              </div>
            ))}
            <div className="form-actions">
              <button
                disabled={!canSave}
                onClick={() =>
                  onSave({
                    type: 'weights',
                    payload: {
                      id: generateId(),
                      templateId,
                      date: getTodayDateString(),
                      sets,
                    },
                  })
                }
              >
                Save Weights Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
