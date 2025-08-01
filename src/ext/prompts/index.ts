import { confirmStart } from './confirm-start';
import { requestGlob } from './request-glob';
import { requestBranch } from './request-branch';
import { selectWorkspaceFolder } from './select-workspace-folder';
import { useDefaultExcludes } from './use-default-excludes';

const prompts = { requestGlob, requestBranch, useDefaultExcludes, confirmStart, selectWorkspaceFolder };

export default prompts;