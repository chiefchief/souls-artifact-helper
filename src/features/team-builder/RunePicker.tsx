import { useState } from "react";
import { X } from "lucide-react";
import { runeAbilities, runeAbilityById, runes, type HeroRune } from "./runes";
import { RuneIcon } from "./RuneIcon";

export function RunePicker({
  heroName,
  value,
  onSave,
  onClose,
}: {
  heroName: string;
  value?: HeroRune;
  onSave: (rune: HeroRune | null) => void;
  onClose: () => void;
}) {
  const [runeId, setRuneId] = useState(value?.runeId ?? "");
  const [ability, setAbility] = useState<number | null>(value?.ability ?? null);
  return (
    <aside className="formation-picker artifact-preview p-4" aria-label="Rune selection">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="formation-picker-title" className="text-xl font-bold">
            Choose rune
          </h2>
          <p className="mt-1 text-sm text-souls-panel">{heroName}</p>
        </div>
        <button className="formation-action" aria-label="Close rune selection" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {value && (
        <button className="formation-action mt-3" onClick={() => onSave(null)}>
          <X size={16} /> Remove rune
        </button>
      )}
      <p className="my-3 text-xs text-souls-panel">Choose a rune, then its optional fifth-slot ability.</p>
      <div className="picker-roster" aria-label="Rune type">
        {runes.map((rune) => (
          <button
            key={rune.id}
            className="roster-unit"
            title={rune.name}
            aria-label={rune.name}
            aria-pressed={runeId === rune.id}
            data-selected={runeId === rune.id}
            onClick={() => setRuneId(rune.id)}
          >
            <RuneIcon
              rune={rune.type}
              ability={runeId === rune.id && ability !== null ? runeAbilityById.get(ability)?.key : null}
            />
            <span>{rune.typeName}</span>
          </button>
        ))}
      </div>
      <h3 className="mb-2 mt-4 text-sm font-bold">Fifth option · Mythic ability</h3>
      <div className="grid grid-cols-3 gap-2" aria-label="Rune special ability">
        <button
          className="roster-unit col-span-3"
          data-selected={ability === null}
          aria-pressed={ability === null}
          onClick={() => setAbility(null)}
        >
          No special ability
        </button>
        {runeAbilities.map((item) => (
          <button
            key={item.id}
            aria-label={item.name}
            title={item.name}
            className="roster-unit"
            aria-pressed={ability === item.id}
            data-selected={ability === item.id}
            onClick={() => setAbility(item.id)}
          >
            <img className="max-w-12" src={item.imageUrl} alt="" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        <button
          className="min-h-11 min-w-40 cursor-pointer rounded-lg border border-souls-gold bg-souls-gold px-6 py-2.5 text-sm font-bold text-souls-void shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-souls-gold disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!runeId}
          onClick={() => onSave({ runeId, ability })}
        >
          Save rune
        </button>
      </div>
    </aside>
  );
}
