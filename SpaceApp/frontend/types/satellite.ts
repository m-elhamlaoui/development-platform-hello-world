export interface Satellite {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  noradId: string;
  orbitType: string;
  color: number;
} 