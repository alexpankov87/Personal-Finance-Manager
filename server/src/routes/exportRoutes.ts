import express from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

interface Transaction {
  date: string;
  category: { name: string };
  description?: string;
  type: 'income' | 'expense';
  amount: number;
}

const router = express.Router();

router.post('/pdf', async (req, res) => {
  try {
    const transactions = (req.body.transactions || []) as Transaction[];

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
    if (!fs.existsSync(fontPath)) {
      console.error('Font not found:', fontPath);
      return res.status(500).json({ message: 'Font file missing' });
    }
    doc.registerFont('DejaVu', fontPath);
    doc.font('DejaVu');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"');
    doc.pipe(res);

    // Заголовок документа
    doc.fontSize(20).text('Personal Finance Manager', { align: 'center' });
    doc.fontSize(12).text(`Report date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Таблица
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const colPositions = [50, 130, 250, 450];
    let y = 120;

    // Рисуем заголовки
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, colPositions[i], y);
    });
    y += 20;

    // Данные
    doc.font('DejaVu');
    for (const t of transactions) {
      if (!t) continue;
      const row: string[] = [
        new Date(t.date).toLocaleDateString(),
        t.category?.name || '',
        t.description || '',
        `${t.type === 'income' ? '+' : '-'}${t.amount?.toFixed(2) || '0'} ₽`,
      ];
      for (let i = 0; i < row.length; i++) {
        const text = row[i] ?? '';
        doc.text(text, colPositions[i], y);
      }
      y += 20;
      if (y > 750) {
        doc.addPage();
        y = 50;
        // Повторяем заголовки на новой странице
        headers.forEach((header, i) => {
          doc.text(header, colPositions[i], y);
        });
        y += 20;
      }
    }

    // Итоги
    const totalIncome = transactions
      .filter(t => t?.type === 'income')
      .reduce((sum, t) => sum + (t?.amount || 0), 0);
    const totalExpense = transactions
      .filter(t => t?.type === 'expense')
      .reduce((sum, t) => sum + (t?.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    y += 20;
    doc.font('Helvetica-Bold');
    doc.text(`Total Income: ${totalIncome.toFixed(2)} ₽`, 50, y);
    doc.text(`Total Expense: ${totalExpense.toFixed(2)} ₽`, 50, y + 15);
    doc.text(`Balance: ${balance.toFixed(2)} ₽`, 50, y + 30);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'PDF generation failed' });
  }
});

export default router;