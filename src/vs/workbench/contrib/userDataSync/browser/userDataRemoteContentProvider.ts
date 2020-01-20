/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextModelContentProvider, ITextModelService } from 'vs/editor/common/services/resolverService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextModel } from 'vs/editor/common/model';
import { URI } from 'vs/base/common/uri';
import { SyncSource, ISettingsSyncService, USER_DATA_SYNC_SCHEME } from 'vs/platform/userDataSync/common/userDataSync';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IModeService } from 'vs/editor/common/services/modeService';

export class UserDataRemoteContentProvider implements ITextModelContentProvider, IWorkbenchContribution {

	constructor(
		@ITextModelService private readonly textModelResolverService: ITextModelService,
		@ISettingsSyncService private readonly settingsSyncService: ISettingsSyncService,
		@IModelService private readonly modelService: IModelService,
		@IModeService private readonly modeService: IModeService,
	) {
		this.textModelResolverService.registerTextModelContentProvider(USER_DATA_SYNC_SCHEME, this);
	}

	provideTextContent(uri: URI): Promise<ITextModel> | null {
		let promise: Promise<string | null> | undefined;
		if (uri.authority === SyncSource.Settings.toLowerCase()) {
			promise = this.settingsSyncService.getRemotContent();
		}
		if (promise) {
			return promise.then(content => this.modelService.createModel(content || '', this.modeService.create('jsonc'), uri));
		}
		return null;
	}

}