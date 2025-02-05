import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private salt = 10;

  async hashPassword(password: string) {
    return bcrypt.hash(password, this.salt);
  }

  async isMatch(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
