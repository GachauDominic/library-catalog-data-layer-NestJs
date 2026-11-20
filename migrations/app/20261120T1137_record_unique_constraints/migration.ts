#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0bf404bdc294c5d353d0334e31f3c7613c30d7833fbcfaa0da69555f029223c1/contract';
import startContract from '../../snapshots/0bf404bdc294c5d353d0334e31f3c7613c30d7833fbcfaa0da69555f029223c1/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a87d6223ab7de92bd13228422995f4e870bdd2ebaa730fcc0270607f76d5d615/contract';
import endContract from '../../snapshots/a87d6223ab7de92bd13228422995f4e870bdd2ebaa730fcc0270607f76d5d615/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropIndex({ schema: 'public', table: 'Book', index: 'Book_isbn_key' }),
      this.dropIndex({ schema: 'public', table: 'Genre', index: 'Genre_name_key' }),
      this.dropIndex({ schema: 'public', table: 'Review', index: 'Review_bookId_userId_key' }),
      this.dropIndex({ schema: 'public', table: 'User', index: 'User_email_key' }),
      this.addUnique({
        schema: 'public',
        table: 'Book',
        constraint: 'Book_isbn_key',
        columns: ['isbn'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Genre',
        constraint: 'Genre_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Review',
        constraint: 'Review_bookId_userId_key',
        columns: ['bookId', 'userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
