import { banavi } from "./banavi/skills";
import { bloombell } from "./bloombell/skills";
import { estelle } from "./estelle/skills";
import { gladis } from "./gladis/skills";
import { hamm } from "./hamm/skills";
import { katatsu } from "./katatsu/skills";
import { manti } from "./manti/skills";
import { moko } from "./moko/skills";
import { mystet } from "./mystet/skills";
import { nasrune } from "./nasrune/skills";
import { romaelle } from "./romaelle/skills";
import { silbren } from "./silbren/skills";
import { spooky } from "./spooky/skills";
import { tianum } from "./tianum/skills";
import { vailo } from "./vailo/skills";

export const pets = [
  gladis,
  nasrune,
  romaelle,
  tianum,
  hamm,
  spooky,
  mystet,
  bloombell,
  silbren,
  vailo,
  estelle,
  banavi,
  moko,
  katatsu,
  manti,
];

export type { Pet } from "./types";
export { petBattleRules, petReferenceBonuses } from "./mechanics";
