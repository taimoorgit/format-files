import { extensions, Uri } from 'vscode';
import { Logger } from './logger';
import { execFileSync } from 'child_process';
import * as path from 'path';

export class Git {
  private _logger = new Logger('git');

  private _git = extensions.getExtension<GitExtension>('vscode.git')?.exports.getAPI(1);

  private get _gitexe(): string {
    return this._git?.git.path ?? 'git';
  }

  public isIgnored(file: Uri): boolean {
    this._logger.info(`checking '${file}' is ignored by git`);
    const repository = this._git?.repositories.find(repo => file.path.includes(repo.rootUri.path));

    let ignored = false;

    if (repository) {
      try {
        // if exit code is 0, it is ignored
        this.executeGit({ args: ['check-ignore', '-q', file.fsPath], cwd: repository.rootUri.fsPath });
        ignored = true;
      }
      catch (error) {
        ignored = false;
      }
    }

    this._logger.info(`\tis ignored: ${ignored}`);

    return ignored;
  }

  public getChangedFiles(targetBranch: string, workspaceFolder: Uri): Uri[] {
    this._logger.info(`getting files changed compared to branch: ${targetBranch}`);

    try {
      const result = this.executeGit({
        args: ['diff', '--name-only', targetBranch],
        cwd: workspaceFolder.fsPath,
      });

      const changedFiles = result
        .trim()
        .split('\n')
        .filter(file => file.length > 0)
        .map(file => Uri.file(path.join(workspaceFolder.fsPath, file)));

      this._logger.info(`found ${changedFiles.length} changed files:\n${changedFiles.map(f => f.fsPath).join('\n')}`);
      return changedFiles;
    }
    catch (error) {
      this._logger.error(`Failed to get changed files: ${error}`);
      throw new Error(`Failed to get changed files from branch comparison: ${error}`);
    }
  }

  private executeGit(options: { cwd: string, args: string[] }): string {
    return execFileSync(this._gitexe, options.args, { cwd: options.cwd, encoding: 'utf8' });
  }
}