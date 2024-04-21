import { JwtDto } from 'src/auth/dto/jwt.dto';

declare global {
  namespace Express {
    export interface User extends JwtDto {}
  }
}
