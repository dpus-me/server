import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { extend } from 'joi';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}
