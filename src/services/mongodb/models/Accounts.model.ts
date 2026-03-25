import { Schema, model, Model, Types } from 'mongoose';

export enum DefaultAccountPermissions {
  'CUSTODY' = 'CUSTODY',
  'TRADE' = 'TRADE',
  'INTER' = 'INTER',
  'INTRA' = 'INTRA',
}

export enum AccountPermissions {
  'CUSTODY' = 'CUSTODY',
  'TRADE' = 'TRADE',
  'INTER' = 'INTER',
  'INTRA' = 'INTRA',
  'DEFI' = 'DEFI',
}

export enum BlockchainNetworkStatus {
  PENDING_ACCOUNT_ENRICHMENT = 'PENDING_ACCOUNT_ENRICHMENT',
  ACCOUNT_ENRICHED = 'ACCOUNT_ENRICHED',
}
export interface IBlockchainNetwork {
  name: string;
  network?: string;
  type?: string;
  contractAddress?: string;
  blockchainDepositAddress?: string;
  status?: BlockchainNetworkStatus;
}
export interface IAccount {
  accountId: string; // Hashed accountPath
  parentApplicationId?: string; // ApplicationId of the parent application
  parentWalletId: string; // Wallet ID of parent wallet as UUID NOT objectId
  parentVaultName: string; // Vault name of the parents Fireblocks wallet
  parentVaultId: string; // Vault ID of the parents Fireblocks wallet
  currency: string; // BTC, EUR etc.
  accountPath: string; // Medici account path
  syncedOwnerId: string; // UUID of owner as stored on our systems. NOT ObjectId
  ownerType: string; // CORPORATE or CONSUMER
  createdAt: Date;
  balance: string;
  accountEnrichments?: any;
  comment?: string;
  friendlyName?: string;
  relatedJournals: Types.ObjectId[];
  linkedCardId?: string;
  linkedCardIds?: string[];
  linkedBankAccountId?: string;
  blockchainDepositAddress?: string; // TODO: Add type? Bech32/Segwit?
  blockchainNetwork?: IBlockchainNetwork;
  blockchainTransactions?: {
    txHash: string;
    transactions: any;
  }[];
  failedBlockchainTransactions: any;
  status?: string;
  permissions: Array<AccountPermissions>;
  multiChainSupport?: boolean;
  blockchainNetworks?: IBlockchainNetwork[];
  eksEnrichments?: {
    iban?: string;
    accountStatus?: 'ACTIVE' | 'SUSPENDED';
    createdAt?: string; // ISO 8601 string from EKS — not a Date object
  };
}

export const accountSchema = new Schema<IAccount>(
  {
    accountId: { type: String, index: true, unique: true },
    parentApplicationId: { type: String },
    parentWalletId: { type: String },
    parentVaultName: { type: String },
    parentVaultId: { type: String },
    currency: { type: String },
    accountPath: { type: String, index: true, unique: true },
    syncedOwnerId: { type: String },
    ownerType: { type: String }, // TODO: Enumerate
    // https://github.com/Automattic/mongoose/issues/3675
    createdAt: {
      type: Date,
      default: () => {
        return new Date();
      },
    },
    balance: { type: String },
    accountEnrichments: { type: Schema.Types.Mixed },
    comment: { type: String },
    friendlyName: { type: String },
    relatedJournals: [
      {
        type: Types.ObjectId,
        ref: 'Medici_Journal',
      },
    ],
    linkedCardId: { type: String, default: 'UNLINKED' },
    linkedCardIds: [{ type: String }],
    linkedBankAccountId: { type: String, default: 'UNLINKED', index: true },
    blockchainDepositAddress: { type: String, index: true },
    blockchainNetwork: { type: Schema.Types.Mixed },
    blockchainTransactions: [
      {
        txHash: { type: String },
        transactions: [{ type: Schema.Types.Mixed }],
      },
    ], // Fireblocks incoming webhooks is an array of objects indexed by txHash that is an array of txs for that txHash we've seen
    failedBlockchainTransactions: [{ type: Schema.Types.Mixed }],
    status: { type: String, default: 'ACTIVE' }, // TODO: IMPORTANT Enumerate into Account states and perform status checks before transacting with an account
    permissions: [
      {
        type: String,
        default: Object.values(DefaultAccountPermissions),
      },
    ],
    multiChainSupport: { type: Boolean, default: false },
    blockchainNetworks: [{ type: Schema.Types.Mixed }],
    eksEnrichments: {
      _id: false,
      iban: {
        type: String,
        set: (v: string) => v?.toUpperCase(),
        validate: {
          validator: (v: string) => /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(v),
          message: (props: { value: string }) =>
            `${props.value} is not a valid IBAN`,
        },
      },
      accountStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED'] },
      createdAt: { type: String },
    },
  },
  {
    strict: true,
    strictQuery: false, // https://mongoosejs.com/docs/guide.html#strictQuery
  }
);

// TODO: Set indexes - Index accounts[currency].accountId

// Enforce schema validators on update operations so that the IBAN format
// check is not silently bypassed by updateOne / findOneAndUpdate / etc.
accountSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  this.setOptions({ runValidators: true });
  next();
});

// NOTE: sparse index skips documents where 'eksEnrichments.iban' is ABSENT.
// It does NOT skip documents where the field is explicitly null.
// To clear an IBAN without hitting the unique constraint, use $unset, not $set: null.
accountSchema.index(
  { 'eksEnrichments.iban': 1 },
  { unique: true, sparse: true }
);

const accountModel: Model<IAccount> = model<IAccount>(
  'Accounts',
  accountSchema
);

export default accountModel;

/* Generate a human readable description of the above schema */

/*

The account schema is a model that represents an account in the Medici system. It has the following fields:
  accountId: A string that represents the hashed account path.
  parentApplicationId: A string that represents the application ID of the parent application.
  parentWalletId: A string that represents the wallet ID of the parent wallet.
  parentVaultName: A string that represents the vault name of the parent's Fireblocks wallet.
  parentVaultId: A string that represents the vault ID of the parent's Fireblocks wallet.
  currency: A string that represents the currency of the account.
  accountPath: A string that represents the Medici account path.
  syncedOwnerId: A string that represents the UUID of the owner as stored on our systems.
  ownerType: A string that represents the type of owner (corporate or consumer).
  createdAt: A date that represents the creation date of the account.
  balance: A string that represents the balance of the account.
  accountEnrichments: An object that represents additional enrichments for the account.
  comment: A string that represents a comment for the account.
  friendlyName: A string that represents a friendly name for the account.
  relatedJournals: An array of ObjectIds that represent the related journals for the account.
  linkedCardId: A string that represents the linked card ID for the account.
  linkedBankAccountId: A string that represents the linked bank account ID for the account.
  blockchainDepositAddress: A string that represents the blockchain deposit address for the account.
  blockchainNetwork: An object that represents the blockchain network for the account.
  blockchainTransactions: An array of objects that represent the blockchain transactions for the account.
  failedBlockchainTransactions: An array of objects that represent the failed blockchain transactions for the account.
  status: A string that represents the status of the account.
  permissions: An array of strings that represent the permissions for the account

*/
