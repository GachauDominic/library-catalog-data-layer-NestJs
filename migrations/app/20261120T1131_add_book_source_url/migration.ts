#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0bf404bdc294c5d353d0334e31f3c7613c30d7833fbcfaa0da69555f029223c1/contract';
import endContract from '../../snapshots/0bf404bdc294c5d353d0334e31f3c7613c30d7833fbcfaa0da69555f029223c1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/399bf91a5970198488a5a3df5f8f1684bcea5718162adc114bc2644290cdaa60/contract';
import startContract from '../../snapshots/399bf91a5970198488a5a3df5f8f1684bcea5718162adc114bc2644290cdaa60/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Book',
        column: col('sourceUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
