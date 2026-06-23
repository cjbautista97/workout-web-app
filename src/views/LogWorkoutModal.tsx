import { useEffect, useMemo, useState } from 'react';
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
  existingEntry?: RunLogEntry | WeightsLogEntry;
  onSave: (entry: { type: 'running'; payload: RunLogEntry } | { type: 'weights'; payload: WeightsLogEntry }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function LogWorkoutModal({ templateId, data, existingEntry, onSave, onDelete, onClose }: Props) {
  const template = data.templates.find((item) => item.id === templateId);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [sets, setSets] = useState<WeightSet[]>([{ sets: 0, weightLbs: 0, rpe: 0, effort: 1 }]);

  useEffect(() => {
    if (!existingEntry) return;

    if ('distanceMiles' in existingEntry) {
      setDistanceMiles(existingEntry.distanceMiles);
      setDurationMinutes(existingEntry.durationMinutes);
    } else {
      setSets(existingEntry.sets.length ? existingEntry.sets : [{ sets: 0, weightLbs: 0, rpe: 0, effort: 1 }]);
    }
  }, [existingEntry]);

  if (!template) return null;

  const handleSetChange = (index: number, field: keyof WeightSet, value: string) => {
    const nextSets = [...sets];
    nextSets[index] = {
      ...nextSets[index],
      [field]: Number(value),
    };
    setSets(nextSets);
  };

  const addSet = () => setSets([...sets, { sets: 0, weightLbs: 0, rpe: 0, effort: 1 }]);
  const removeSet = (index: number) => setSets(sets.filter((_, i) => i !== index));

  const canSave = useMemo(() => {
    if (template.type === 'running') {
      return distanceMiles > 0 && durationMinutes > 0;
    }
    return sets.every(
      (set) =>
        set.sets > 0 &&
        set.weightLbs >= 0 &&
        set.rpe >= 0 &&
        set.rpe <= 10 &&
        set.effort >= 1 &&
        set.effort <= 10,
    );
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
              {onDelete ? (
                <button className="secondary-button" type="button" onClick={onDelete}>
                  Delete
                </button>
              ) : null}
              <button
                disabled={!canSave}
                onClick={() =>
                  onSave({
                    type: 'running',
                    payload: {
                      id: existingEntry && 'distanceMiles' in existingEntry ? existingEntry.id : generateId(),
                      templateId,
                      date: existingEntry && 'distanceMiles' in existingEntry ? existingEntry.date : getTodayDateString(),
                      loggedAt: existingEntry ? existingEntry.loggedAt : new Date().toISOString(),
                      distanceMiles,
                      durationMinutes,
                    },
                  })
                }
              >
                {existingEntry ? 'Update Run Log' : 'Save Run Log'}
              </button>
            </div>
          </div>
        ) : (
          <div className="form-card">
            <div className="sets-header">
              <span>Strength Entry</span>
              <button className="secondary-button" onClick={addSet} type="button">
                Add Set
              </button>
            </div>
            <div className="set-row set-row-labels">
              <div>Reps</div>
              <div>Weight</div>
              <div>RPE</div>
              <div>Effort</div>
              <div />
            </div>
            {sets.map((set, index) => (
              <div key={index} className="set-row">
                <input
                  type="number"
                  min="0"
                  value={set.sets}
                  placeholder="Reps"
                  onChange={(event) => handleSetChange(index, 'sets', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={set.weightLbs}
                  placeholder="Weight"
                  onChange={(event) => handleSetChange(index, 'weightLbs', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={set.rpe}
                  placeholder="RPE"
                  onChange={(event) => handleSetChange(index, 'rpe', event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={set.effort}
                  placeholder="Effort"
                  onChange={(event) => handleSetChange(index, 'effort', event.target.value)}
                />
                <button className="secondary-button" type="button" onClick={() => removeSet(index)}>
                  Remove
                </button>
              </div>
            ))}
            <div className="form-actions">
              {onDelete ? (
                <button className="secondary-button" type="button" onClick={onDelete}>
                  Delete
                </button>
              ) : null}
              <button
                disabled={!canSave}
                onClick={() =>
                  onSave({
                    type: 'weights',
                    payload: {
                      id: existingEntry && 'sets' in existingEntry ? existingEntry.id : generateId(),
                      templateId,
                      date: existingEntry && 'sets' in existingEntry ? existingEntry.date : getTodayDateString(),
                      loggedAt: existingEntry ? existingEntry.loggedAt : new Date().toISOString(),
                      sets,
                    },
                  })
                }
              >
                {existingEntry ? 'Update Weights Log' : 'Save Weights Log'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
