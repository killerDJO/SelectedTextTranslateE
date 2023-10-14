import { Menu, Tray, nativeImage, NativeImage, MenuItemConstructorOptions } from 'electron';
import { Subject, BehaviorSubject, fromEventPattern, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { injectable } from 'inversify';
import { isString } from 'lodash';

import { Tag } from '@selected-text-translate/common';

import { mapSubject } from '~/utils/observable.utils';
import { SettingsProvider } from '~/infrastructure/settings-provider.service';

import { IconsProvider } from './framework/icons-provider.service';

@injectable()
export class Taskbar {
  private tray!: Tray;

  // Icon should be stored as field to avoid being garbage collected
  private currentIcon: NativeImage | null = null;

  public readonly showSettings$: Subject<void> = new Subject();
  public readonly showHistory$: Subject<void> = new Subject();
  public readonly showAbout$: Subject<void> = new Subject();
  public readonly isSuspended$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly translateSelectedText$: Subject<void> = new Subject();

  public constructor(
    private readonly iconsProvider: IconsProvider,
    private readonly settingsProvider: SettingsProvider
  ) {
    this.createTaskBar();

    fromEventPattern((handler: () => void) => this.tray.on('click', handler)).subscribe(() =>
      this.translateSelectedText$.next()
    );
    this.isSuspended$.pipe(distinctUntilChanged()).subscribe(() => this.updateTrayState());
    this.getCurrentTags().subscribe(() => this.updateTrayState());
  }

  public watchPlayingState(isPlaying$: Observable<boolean>): void {
    isPlaying$.pipe(distinctUntilChanged()).subscribe(isPlaying => {
      if (isPlaying) {
        this.tray.setImage(this.getIcon('tray-playing'));
      } else {
        this.tray.setImage(this.getCurrentIcon());
      }
    });
  }

  public suspend(): void {
    this.isSuspended$.next(true);
  }

  public resume(): void {
    this.isSuspended$.next(false);
  }

  private getCurrentTags(): BehaviorSubject<ReadonlyArray<Tag>> {
    return mapSubject(this.settingsProvider.getSettings(), settings => {
      return settings.tags.currentTags.map(currentTag =>
        isString(currentTag) ? { tag: currentTag, isEnabled: true } : currentTag
      );
    });
  }

  private createTaskBar(): void {
    this.tray = new Tray(this.getCurrentIcon());
    this.tray.setToolTip('Selected text translate..');
    this.tray.setContextMenu(this.createContextMenu());
  }

  private getIcon(iconType: string): NativeImage {
    return nativeImage.createFromPath(this.iconsProvider.getIconPath(iconType));
  }

  private updateTrayState(): void {
    this.tray.setImage(this.getCurrentIcon());
    this.tray.setContextMenu(this.createContextMenu());
  }

  private getCurrentIcon(): NativeImage {
    this.currentIcon = this.getIcon(this.isSuspended$.value ? 'tray-suspended' : 'tray');
    return this.currentIcon;
  }

  private createContextMenu(): Electron.Menu {
    const suspendMenuItem: Electron.MenuItemConstructorOptions = this.isSuspended$.value
      ? { label: 'Enable', click: () => this.isSuspended$.next(false) }
      : { label: 'Suspend', click: () => this.isSuspended$.next(true) };

    const tagsList = this.getCurrentTags().value.map(tag => {
      const options: MenuItemConstructorOptions = {
        label: tag.tag,
        type: 'checkbox',
        checked: tag.isEnabled,
        click: () => this.toggleTag(tag)
      };
      return options;
    });

    return Menu.buildFromTemplate([
      { label: 'Translate from clipboard', click: () => this.translateSelectedText$.next() },
      { label: 'History', click: () => this.showHistory$.next() },
      { label: 'Settings', click: () => this.showSettings$.next() },
      { type: 'separator' },
      { label: 'Tags', submenu: tagsList },
      suspendMenuItem,
      { type: 'separator' },
      { label: 'About', click: () => this.showAbout() },
      { label: 'Quit', type: 'normal', role: 'quit' }
    ]);
  }

  private showAbout(): void {
    this.showAbout$.next();
  }

  private toggleTag(tag: Tag): void {
    const filteredTags = this.getCurrentTags().value.filter(
      currentTag => currentTag.tag !== tag.tag
    );

    this.settingsProvider.updateSettings({
      tags: {
        currentTags: filteredTags.concat([
          {
            tag: tag.tag,
            isEnabled: !tag.isEnabled
          }
        ])
      }
    });
  }
}
