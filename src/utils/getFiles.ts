import { Glob } from 'bun';
import { join } from 'path';

export default async (root: string): Promise<string[]> => {
  const glob = new Glob('**/*');
  const filePaths: string[] = [];

  for await (const relativePath of glob.scan({ 'cwd': root, 'onlyFiles': true, 'dot': true }))
    filePaths.push(join(root, relativePath));

  return filePaths;
};
