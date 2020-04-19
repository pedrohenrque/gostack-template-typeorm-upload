import fs from 'fs';
import path from 'path';
import csvtojson from 'csvtojson';

import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';

import AppError from '../errors/AppError';

interface ImportData {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(transactionsFilename: string): Promise<ImportData[]> {
    const csv_path = path.join(uploadConfig.directory, transactionsFilename);
    const csv_exists = await fs.promises.stat(csv_path);

    if (!csv_exists) {
      throw new AppError('Arquivo não encontrado', 404);
    }

    const imports: ImportData[] = await csvtojson().fromFile(csv_path);
    const createTransaction = new CreateTransactionService();

    for (const item of imports) {
      const { title, type, value, category } = item;

      await createTransaction.execute({
        title,
        type,
        value,
        category,
      });
    }

    return imports;
  }
}

export default ImportTransactionsService;
