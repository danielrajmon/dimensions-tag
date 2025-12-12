export interface Character {
  id: number;
  name: string;
  world: string;
}

export interface Vehicle {
  id: number;
  name: string;
  code?: string;
}

export interface TagData {
  name: string;
  characterCode: string;
  pwd: string;
  charPart1: string;
  charPart2: string;
  charPart3: string;
  charPart4: string;
  pwdPart1: string;
  pwdPart2: string;
  type?: string;
  vehicleCode?: string;
  vehicleFlag?: string;
}
