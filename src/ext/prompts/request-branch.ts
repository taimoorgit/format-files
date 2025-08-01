import { window, workspace } from 'vscode';
import { OperationAborted } from '../errors/operation-aborted';
import { Logger } from '../utilities/logger';

const logger = new Logger('request-branch');
const LAST_BRANCH_KEY = 'formatFiles.lastBranch';

export async function requestBranch(): Promise<string> {
  const lastBranch = getLastBranch();
  const placeholder = lastBranch ? `Enter target branch (last used: ${lastBranch})` : 'Enter target branch (e.g., main, master, develop)';

  const maybeBranch = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: placeholder,
    prompt: 'Format Files changed compared to branch - press esc to cancel',
    value: lastBranch,
  });

  logger.info(`branch entered: ${maybeBranch}`);

  if (!maybeBranch) {
    throw new OperationAborted('Branch name undefined or empty');
  }

  const confirmed = await confirmBranchInput(maybeBranch);
  if (!confirmed) {
    throw new OperationAborted('User aborted');
  }

  // Save the branch for next time
  await saveLastBranch(maybeBranch);

  return maybeBranch;
}

async function confirmBranchInput(branch: string): Promise<boolean> {
  const result = await window.showQuickPick(['Yes', 'No'], {
    ignoreFocusOut: true,
    placeHolder: `Compare and format files changed since '${branch}', is that correct?`,
  });

  return result === 'Yes';
}

function getLastBranch(): string | undefined {
  return workspace.getConfiguration().get<string>(LAST_BRANCH_KEY);
}

async function saveLastBranch(branch: string): Promise<void> {
  await workspace.getConfiguration().update(LAST_BRANCH_KEY, branch, true);
}