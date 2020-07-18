import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export default class Hashing {
  public create(string: string) {
    return bcrypt.hashSync(string, 10);
  }

  public verify(string: string, hash) {
    return bcrypt.compareSync(string, hash);
  }
}
