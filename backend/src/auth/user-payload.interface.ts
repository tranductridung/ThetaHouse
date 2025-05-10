import { UserRole } from 'src/common/enums/enum';

export interface UserPayload {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}
