import { Tray, Menu, app, BrowserWindow, shell } from 'electron';
import ElectronStore from 'electron-store';

import { IpcEvent, StoreKeys } from '../../shared/constants';
import { AppStore } from '../../shared/types';

export default class TrayIcon {
	private tray: Tray;

	constructor(private store: ElectronStore<AppStore>, private overlay: BrowserWindow) {}

	buildTray(trayIconPath: string) {
		this.tray = new Tray(trayIconPath);

		this.tray.setToolTip(`GhostChat v${app.getVersion()}`);

		const trayIconMenu = Menu.buildFromTemplate([
			{
				label: `GhostChat v${app.getVersion()}`,
				enabled: false,
			},
			{
				label: 'Open config',
				type: 'normal',
				click: () => {
					shell.showItemInFolder(this.store.path);
				},
			},
			{
				label: 'Disable Vanish',
				type: 'normal',
				click: () => {
					if (!this.store.get('settings').isOpen && this.store.get('savedWindowState').isTransparent) {
						this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
							...this.store.get('savedWindowState'),
							isClickThrough: false,
							isTransparent: false,
						});

						this.overlay.setIgnoreMouseEvents(false);
						this.overlay.webContents.send(IpcEvent.ShowApp);
					}
				},
			},
			{
				label: 'Disable Click-Through',
				type: 'normal',
				click: () => {
					this.store.set('savedWindowState.isClickThrough', false);

					this.overlay.setIgnoreMouseEvents(false);
				},
			},
			{
				label: 'Exit',
				click: () => {
					app.quit();
				},
			},
		]);

		this.tray.setContextMenu(trayIconMenu);
	}
}
