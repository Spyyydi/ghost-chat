import type { BrowserWindow } from 'electron';
import type ElectronStore from 'electron-store';
import type { AppUpdater } from 'electron-updater';

import type { AppStore, Updater } from '#ipc/types/store.js';

import { ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { IpcEvent } from '#ipc/constants/events.js';

export default class ManualUpdater {
    private logPrefix = this.constructor.name;

    private settings: BrowserWindow | null = null;

    private updater: AppUpdater;

    private updaterSettings: Updater;

    constructor(
        private store: ElectronStore<AppStore>,
        private forceDevUpdateConfig: boolean,
    ) {
        this.updaterSettings = this.store.get('updater');

        this.updater = autoUpdater;

        this.init();
    }

    private registerIPCListeners() {
        ipcMain.on(IpcEvent.CheckForUpdates, () => {
            this.updater.checkForUpdatesAndNotify();
        });
    }

    private registerUpdaterListeners() {
        this.updater.on('checking-for-update', () => {
            log.info(`[${this.logPrefix}] checking for update`);
        });

        this.updater.on('update-available', (info) => {
            log.info(`[${this.logPrefix}] update-available`, info.version);

            if (info.version.includes('beta') && this.updaterSettings.channel !== 'beta') {
                this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
            } else if (process.platform !== 'darwin') {
                this.updater.downloadUpdate();
                this.sendStatusToWindow(IpcEvent.UpdateAvailable, info.version);
            } else {
                this.sendStatusToWindow(IpcEvent.ManualUpdateRequired, info.version);
            }
        });

        this.updater.on('update-not-available', () => {
            log.info(`[${this.logPrefix}] update-not-available`);
            this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
        });

        this.updater.on('error', (error) => {
            log.error('error', error);
            this.sendStatusToWindow(IpcEvent.Error);
        });

        this.updater.on('update-downloaded', () => {
            log.info(`[${this.logPrefix}] update-downloaded`);
            this.sendStatusToWindow(IpcEvent.UpdateDownloaded);
        });
    }

    private sendStatusToWindow(message: string, args?: string | Record<string, unknown>) {
        this.settings?.webContents.send(message, args);
    }

    init() {
        this.updater.logger = log;
        this.updater.autoDownload = false;
        this.updater.disableWebInstaller = true;

        if (this.forceDevUpdateConfig) {
            this.updater.forceDevUpdateConfig = true;
        }

        if (this.updaterSettings.channel === 'beta') {
            this.updater.allowPrerelease = true;
        }

        this.registerIPCListeners();
        this.registerUpdaterListeners();
    }

    registerWindow(settings: BrowserWindow) {
        this.settings = settings;
    }
}
