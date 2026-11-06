import { petBattleRules, petReferenceBonuses, type Pet } from "../../pets/pets";

export function PetDetails({ pet }: { pet: Pet }) {
  return (
    <section className="mt-4 space-y-4 border-t border-souls-spirit/20 pt-4" aria-label={`${pet.name} details`}>
      <h3 className="text-lg font-bold">{pet.name}</h3>
      {pet.skills.map((skill) => (
        <div key={skill.id}>
          <p className="text-xs uppercase tracking-wider text-souls-gold">{skill.type}</p>
          <h4 className="mt-1 text-sm font-bold">{skill.name}</h4>
          <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">{skill.description}</p>
        </div>
      ))}
      <div>
        <h4 className="text-sm font-bold">Energy & activation</h4>
        <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">{petBattleRules.energy.description}</p>
        <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">
          {petBattleRules.energy.additionalGainDescription}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">
          {petBattleRules.energy.activationDescription}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-bold">Skill power</h4>
        <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">{petBattleRules.skillPower.description}</p>
        <p className="mt-1 text-sm leading-relaxed text-souls-panel/85">{petBattleRules.targetingDescription}</p>
      </div>
      <details className="text-sm text-souls-panel/85">
        <summary className="cursor-pointer font-semibold">Shared stat bonuses</summary>
        <p className="mt-2 leading-relaxed">{petBattleRules.statsDescription}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          {(["atk", "def", "hp"] as const).map((stat) => (
            <div className="rounded border border-souls-spirit/20 p-2" key={stat}>
              <dt className="text-xs uppercase">{stat}</dt>
              <dd className="mt-1 font-bold text-souls-gold">+{petReferenceBonuses[stat]}%</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs leading-relaxed">Reference values; the corresponding pet level is not recorded.</p>
      </details>
    </section>
  );
}
