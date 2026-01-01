import { SetMetadata } from '@nestjs/common';

export const UNAUTHORIZED_KEY = 'unauthorized';
export const Unauthorized = () => SetMetadata(UNAUTHORIZED_KEY, true);
