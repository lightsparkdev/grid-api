import type { ApiCall } from '@/data/flow';

export interface Entry extends ApiCall {
  key: string;
  fresh: boolean;
}
