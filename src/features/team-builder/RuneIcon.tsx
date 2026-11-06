import {
  runeByType,
  runeAbilityByKey,
  RUNE_ABILITY_WIDTH_RATIO,
  RUNE_ABILITY_OVERHANG_RATIO,
  type RuneAppearance,
} from "./runes";
import "./rune-icon.css";

export function RuneIcon({
  rune: runeType,
  ability,
  className = "",
}: RuneAppearance & {
  className?: string;
}) {
  const rune = runeByType.get(runeType);
  const skill = ability ? runeAbilityByKey.get(ability) : undefined;
  if (!rune) return null;

  return (
    <div className={`rune-icon ${className}`} role="img" aria-label={`${rune.name}${skill ? ` · ${skill.name}` : ""}`}>
      <img className="rune-icon__image" src={rune.imageUrl} alt="" />
      {skill && (
        <img
          className="rune-icon__ability"
          src={skill.imageUrl}
          alt=""
          style={{
            width: `${RUNE_ABILITY_WIDTH_RATIO * 100}%`,
            left: `${-RUNE_ABILITY_OVERHANG_RATIO * 100}%`,
            bottom: `${-RUNE_ABILITY_OVERHANG_RATIO * 100}%`,
          }}
        />
      )}
    </div>
  );
}
