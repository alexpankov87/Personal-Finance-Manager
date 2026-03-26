import express from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Все запросы на экспорт требуют авторизации
router.use(authMiddleware);

router.post('/pdf', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const transactions = req.body.transactions || [];

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

    doc.fontSize(18).text('Список транзакций', { align: 'center' });
    doc.moveDown();

    const pageWidth = (doc as any).page.width - 60 || 550;
    const colWidths = [80, 130, 200, pageWidth - 80 - 130 - 200];
    const headers = ['Дата', 'Категория', 'Описание', 'Сумма'];

    let y = 100;

    // Заголовки таблицы
    doc.fontSize(10);
    headers.forEach((header, i) => {
      const x = 30 + (i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0));
      doc.text(header, x, y, { width: colWidths[i], align: i === 3 ? 'right' : 'left' });
    });
    y += 20;

    // Данные (уже принадлежат пользователю, т.к. клиент передал только его транзакции)
    for (const t of transactions) {
      const row = [
        new Date(t.date).toLocaleDateString(),
        t.category.name,
        t.description || '',
        `${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)} ₽`,
      ];
      for (let i = 0; i < row.length; i++) {
        const x = 30 + (i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0));
        const text = row[i];
        const truncated = text.length > 30 ? text.slice(0, 27) + '...' : text;
        doc.text(truncated, x, y, {
          width: colWidths[i],
          align: i === 3 ? 'right' : 'left',
          ellipsis: true,
        });
      }
      y += 20;
      if (y > (doc as any).page.height - 50) {
        doc.addPage();
        y = 50;
      }
    }

    // Итоги
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    y += 15;
    doc.fontSize(10);
    doc.text(`Итого доходов: ${totalIncome.toFixed(2)} ₽`, 30, y);
    doc.text(`Итого расходов: ${totalExpense.toFixed(2)} ₽`, 30, y + 15);
    doc.text(`Баланс: ${balance.toFixed(2)} ₽`, 30, y + 30);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'PDF generation failed' });
  }
});

export default router;