import * as path from 'path';
import * as moduleAlias from 'module-alias';

const aliases = {
  '~': path.resolve(__dirname)
};

Object.keys(aliases).forEach(alias => {
  moduleAlias.addAlias(alias, (aliases as any)[alias]);
});
