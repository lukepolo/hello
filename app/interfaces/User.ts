export interface User {
  id: string;
  name: string;
  muted: boolean;
  viewing?: boolean;
  presenting?: boolean;
  broadcasting?: boolean;
}
