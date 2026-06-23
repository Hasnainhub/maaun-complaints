import fs from 'fs';
import path from 'path';

// Define the path to our local JSON file
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Helper to read DB
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Helper to write DB
function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Implement a chainable query builder like Supabase
export const MockDB = {
  from(table: string) {
    return new QueryBuilder(table);
  }
};

class QueryBuilder {
  private table: string;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private queryParams: any = {};
  private payload: any = null;
  private isSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    if (this.action === 'select' && !this.payload) {
      this.action = 'select';
    }
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.queryParams[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.queryParams[`${column}_neq`] = value;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.queryParams.order = { column, ascending: options?.ascending !== false };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: (value: any) => void, reject: (reason?: any) => void) {
    try {
      const db = readDB();
      const records = db[this.table] || [];
      
      let result: any = null;
      let error: any = null;

      const matchesFilters = (record: any) => {
        let match = true;
        for (const key in this.queryParams) {
          if (key === 'order') continue;
          if (key.endsWith('_neq')) {
            const actualKey = key.replace('_neq', '');
            if (record[actualKey] === this.queryParams[key]) {
              match = false;
              break;
            }
          } else {
            if (record[key] !== this.queryParams[key]) {
              match = false;
              break;
            }
          }
        }
        return match;
      };

      if (this.action === 'select') {
        let filtered = records.filter(matchesFilters);

        if (this.queryParams.order) {
           const { column, ascending } = this.queryParams.order;
           filtered.sort((a: any, b: any) => {
             if (a[column] < b[column]) return ascending ? -1 : 1;
             if (a[column] > b[column]) return ascending ? 1 : -1;
             return 0;
           });
        }

        if (this.isSingle) {
          result = filtered.length > 0 ? filtered[0] : null;
          if (!result) {
              // Supabase single() returns error if no rows found
              error = { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' };
          }
        } else {
          result = filtered;
        }
      } 
      else if (this.action === 'insert') {
        const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
        
        // Auto-generate defaults like Supabase does
        const enrichedToInsert = toInsert.map((item: any) => {
          const now = new Date().toISOString();
          const enriched = {
            id: require('crypto').randomUUID(),
            created_at: now,
            updated_at: now,
            ...item
          };
          if (this.table === 'complaints' && !enriched.tracking_id) {
            enriched.tracking_id = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          return enriched;
        });

        db[this.table] = [...records, ...enrichedToInsert];
        writeDB(db);
        result = this.isSingle ? enrichedToInsert[0] : enrichedToInsert;
      }
      else if (this.action === 'update') {
        let lastUpdated = null;
        let updatedRecords: any[] = [];
        db[this.table] = records.map((record: any) => {
          if (matchesFilters(record)) {
            lastUpdated = { ...record, ...this.payload };
            updatedRecords.push(lastUpdated);
            return lastUpdated;
          }
          return record;
        });
        writeDB(db);
        result = this.isSingle ? lastUpdated : updatedRecords;
      }
      else if (this.action === 'delete') {
         db[this.table] = records.filter((record: any) => !matchesFilters(record));
        writeDB(db);
        result = null;
      }

      // Supabase format usually returns { data, error }
      resolve({ data: result, error });
    } catch (e: any) {
      resolve({ data: null, error: { message: e.message } });
    }
  }
}
