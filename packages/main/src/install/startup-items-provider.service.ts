import path = require('path');
import { injectable } from 'inversify';

@injectable()
export class StartupItemsProvider {
  private readonly appFolder = path.resolve(process.execPath, '..');
  private readonly exeName = path.basename(process.execPath);
  private readonly updateExe = path.resolve(path.join(this.appFolder, '..', 'Update.exe'));

  public get exePath(): string {
    return this.exeName;
  }

  public get updateExePath(): string {
    return this.updateExe;
  }
}
