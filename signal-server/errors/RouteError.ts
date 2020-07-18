export default class RouteError extends Error {
  protected status;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
