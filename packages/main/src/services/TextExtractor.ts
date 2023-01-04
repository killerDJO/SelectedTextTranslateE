import { clipboard } from 'electron';
import { Subject, Observable } from 'rxjs';
import { injectable } from 'inversify';

import * as nativeExtensions from '~/native-extensions/native-extensions.node';
import { SettingsProvider } from '~/infrastructure/SettingsProvider';

@injectable()
export class TextExtractor {
  constructor(private readonly settingsProvider: SettingsProvider) {}

  public getSelectedText(): Observable<string> {
    nativeExtensions.broadcastCopyCommand();

    const textToTranslate$ = new Subject<string>();
    const copyDelayMilliseconds =
      this.settingsProvider.getSettings().value.engine.copyDelayMilliseconds;
    setTimeout(() => {
      textToTranslate$.next(clipboard.readText());
      textToTranslate$.complete();
    }, copyDelayMilliseconds);

    return textToTranslate$;
  }
}
