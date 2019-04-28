const noop = () => { /* noop */ };
export class BooleanSetting {
  private value: boolean;
  public constructor(
    private key: string,
    defaultValue: boolean,
    private onUpdate: (newValue: boolean) => void = noop,
  ) {
    if (defaultValue) {
      this.value = window.localStorage.getItem(key) !== 'false';
    } else {
      this.value = window.localStorage.getItem(key) === 'true';
    }
    this.updateLocalStorage();
    this.onUpdate(this.value);
  }
  private updateLocalStorage() {
    window.localStorage.setItem(this.key, String(this.value));
  }
  public getValue() {
    return this.value;
  }
  public setValue(newValue: boolean) {
    if (newValue !== this.value) {
      this.onUpdate(newValue);
    }
    this.value = newValue;
    this.updateLocalStorage();
  }
  public toggle() {
    this.setValue(!this.value);
  }
}

export const animation = new BooleanSetting('animation', true, value => {
  document.body.classList.toggle('animation-enabled', value);
});
export const warning = new BooleanSetting('warning', false);
export const earlyAccess = new BooleanSetting('earlyAccess', false, value => {
  document.body.classList.toggle('early-access-disabled', !value);
});
export const useComments = new BooleanSetting('useComments', true);
