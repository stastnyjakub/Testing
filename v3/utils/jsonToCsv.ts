import { Response } from 'express';
import { Parser } from 'json2csv';
import { ExportCsvField } from 'v3/carrier/carrier.interface';

export const downloadCsv = (res: Response, fileName: string, fields: ExportCsvField[], data: any[]): Response => {
  const jsonParser = new Parser({ fields });
  for (const datum of data) {
    for (const field of fields) {
      const { formatter, value } = field;
      formatter && (datum[value] = formatter(datum[value]));
    }
  }
  const csv = jsonParser.parse(data);
  const fileNameWithDate = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=${fileNameWithDate}`);
  return res.send(csv);
};
