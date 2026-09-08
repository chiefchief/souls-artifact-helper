export type PetActiveSkill = {
  id: string;
  type: "active";
  name: string;
  description: string;
};
export type PetPassiveSkill = {
  id: string;
  type: "passive";
  name: string;
  description: string;
};

export type Pet = {
  id: string;
  name: string;
  imageUrl: string;
  skills: [PetActiveSkill, PetPassiveSkill];
};
