export interface NetworkController {
  redirect(path: string): null | string;
}

export const disabled: NetworkController = {
  redirect(path: string) {
    return null;
  }
};
