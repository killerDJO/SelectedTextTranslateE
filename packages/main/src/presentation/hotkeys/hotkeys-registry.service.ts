import { globalShortcut } from 'electron';
import { Subject, BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';

import { Hotkey, HotkeySettings } from '@selected-text-translate/common';

import { NotificationSender } from '~/infrastructure/notification-sender.service';
import { Logger } from '~/infrastructure/logger.service';
import { SettingsProvider } from '~/infrastructure/settings-provider.service';

@injectable()
export class HotkeysRegistry {
  private areHotkeysPaused = false;
  private currentHotkeys: HotkeySettings;

  private readonly toggleSuspend$: Subject<void> = new Subject();

  public readonly areHotkeysSuspended$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly translate$: Subject<void> = new Subject();
  public readonly playText$: Subject<void> = new Subject();
  public readonly showDefinition$: Subject<void> = new Subject();
  public readonly inputText$: Subject<void> = new Subject();

  constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly notificationSender: NotificationSender,
    private readonly logger: Logger
  ) {
    this.currentHotkeys = this.getHotkeys();
    this.settingsProvider.getSettings().subscribe(() => this.remapHotkeys());

    this.toggleSuspend$.subscribe(() => this.processToggleSuspend());
  }

  public registerHotkeys(): void {
    this.registerAllHotkeys(this.currentHotkeys);
  }

  public pauseHotkeys(): void {
    this.areHotkeysPaused = true;
    this.unregisterAllHotkeys(this.currentHotkeys);
  }

  public resumeHotkeys(): void {
    this.areHotkeysPaused = false;
    this.registerAllHotkeys(this.currentHotkeys);
  }

  public suspendHotkeys(): void {
    this.areHotkeysSuspended$.next(true);
    this.unregisterAllHotkeys(this.currentHotkeys);
  }

  public enableHotkeys(): void {
    this.areHotkeysSuspended$.next(false);
    this.registerAllHotkeys(this.currentHotkeys);
  }

  private processToggleSuspend(): void {
    if (this.areHotkeysSuspended$.value) {
      this.enableHotkeys();
    } else {
      this.suspendHotkeys();
    }
  }

  private getHotkeys(): HotkeySettings {
    return this.settingsProvider.getSettings().value.hotkeys;
  }

  private get areHotkeysDisabled(): boolean {
    return this.areHotkeysPaused || this.areHotkeysSuspended$.value;
  }

  private remapHotkeys(): void {
    if (this.areHotkeysDisabled) {
      this.currentHotkeys = this.getHotkeys();
      return;
    }

    this.unregisterAllHotkeys(this.currentHotkeys, true);
    this.registerAllHotkeys(this.getHotkeys(), true);
    this.currentHotkeys = this.getHotkeys();
  }

  private registerAllHotkeys(hotkeys: HotkeySettings, includeSuspendHotkey = false): void {
    if (this.areHotkeysDisabled) {
      return;
    }

    this.registerCommand(hotkeys.translate, () => this.translate$.next());
    this.registerCommand(hotkeys.playText, () => this.playText$.next());
    this.registerCommand(hotkeys.inputText, () => this.inputText$.next());
    this.registerCommand(hotkeys.showDefinition, () => this.showDefinition$.next());

    if (includeSuspendHotkey) {
      this.registerCommand(hotkeys.toggleSuspend, () => this.toggleSuspend$.next());
    }
  }

  private unregisterAllHotkeys(hotkeys: HotkeySettings, includeSuspendHotkey = false): void {
    this.unregisterCommand(hotkeys.translate);
    this.unregisterCommand(hotkeys.playText);
    this.unregisterCommand(hotkeys.inputText);
    this.unregisterCommand(hotkeys.showDefinition);

    if (includeSuspendHotkey) {
      this.unregisterCommand(hotkeys.toggleSuspend);
    }
  }

  private registerCommand(hotkeys: Hotkey[], action: () => void): void {
    hotkeys.forEach(hotkey => {
      try {
        globalShortcut.register(this.createAccelerator(hotkey), action);
      } catch {
        this.notificationSender.send(
          'Unsupported hotkey',
          `This hotkeys combination is unsupported for global hotkeys: ${this.createAccelerator(
            hotkey
          ).toString()}.`
        );
      }
    });
  }

  private unregisterCommand(hotkeys: Hotkey[]): void {
    hotkeys.forEach(hotkey => {
      try {
        globalShortcut.unregister(this.createAccelerator(hotkey));
      } catch {
        this.logger.warning(
          `Attempting to unbind unsupported hotkeys sequence: ${this.createAccelerator(
            hotkey
          ).toString()}`
        );
      }
    });
  }

  private createAccelerator(hotkey: Hotkey): Electron.Accelerator {
    return hotkey.keys.join('+');
  }
}
