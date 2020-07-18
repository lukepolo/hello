import bcrypt from "bcrypt";
import hashids from "hashids";
import Bindings from "./constants/Bindings";
import { inject, injectable } from "inversify";

@injectable()
export default class Hashing {
  private hashids;

  constructor(@inject(Bindings.ENV) env) {
    this.hashids = new hashids(env.APP_KEY, 15, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }

  public create(string: string) {
    return bcrypt.hashSync(string, 10);
  }

  public verify(string: string, hash) {
    return bcrypt.compareSync(string, hash);
  }

  public encodeAsHashId(string: BigInt) {
    return this.hashids.encode(BigInt(string));
  }

  public decodeHashId(string) {
    let decoded = this.hashids.decode(string);
    if (decoded) {
      return decoded[0];
    }
    return false;
  }
}
