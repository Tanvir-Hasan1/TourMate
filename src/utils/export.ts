import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Trip } from '../store/types';

export const exportTripToCSV = async (trip: Trip) => {
  let csv = 'Date,Title,Amount,Category,Paid By,Split Between\n';
  
  trip.expenses.forEach(e => {
    const paidBy = trip.members.find(m => m.id === e.paidById)?.name || 'Unknown';
    const splitBetween = e.splits.map(s => trip.members.find(m => m.id === s.memberId)?.name).join('; ');
    
    csv += `${new Date(e.date).toLocaleDateString()},"${e.title}",${e.amount},${e.category},"${paidBy}","${splitBetween}"\n`;
  });

  const filename = `${FileSystem.documentDirectory}${trip.name.replace(/\s+/g, '_')}_expenses.csv`;
  
  await FileSystem.writeAsStringAsync(filename, csv, { encoding: FileSystem.EncodingType.UTF8 });
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filename);
  }
};

export const exportTripSummary = async (trip: Trip) => {
  // Simple text summary for sharing
  let summary = `Trip Summary: ${trip.name}\n`;
  summary += `Destination: ${trip.destination}\n`;
  summary += `Total Spent: ৳${trip.expenses.reduce((sum, e) => sum + e.amount, 0)}\n\n`;
  summary += `Member Balances:\n`;
  
  trip.members.forEach(m => {
    // Simple balance check (Paid - Share)
    const paid = trip.expenses.filter(e => e.paidById === m.id).reduce((sum, e) => sum + e.amount, 0);
    const share = trip.expenses.reduce((sum, e) => {
      const s = e.splits.find(sp => sp.memberId === m.id);
      return sum + (s ? s.amount : 0);
    }, 0);
    summary += `${m.name}: ${paid - share >= 0 ? '+' : ''}৳${(paid - share).toLocaleString()}\n`;
  });
  
  const filename = `${FileSystem.documentDirectory}${trip.name.replace(/\s+/g, '_')}_summary.txt`;
  await FileSystem.writeAsStringAsync(filename, summary);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filename);
  }
};

export const exportTripToPDF = async (trip: Trip) => {
  let tableRows = '';
  
  trip.expenses.forEach(e => {
    const paidBy = trip.members.find(m => m.id === e.paidById)?.name || (e.paidById === 'group_fund' ? 'Group Fund' : 'Unknown');
    const splitBetween = e.splits.map(s => trip.members.find(m => m.id === s.memberId)?.name).join(', ');
    const date = new Date(e.date).toLocaleDateString();
    
    tableRows += `
      <tr>
        <td>${date}</td>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td>৳${e.amount.toLocaleString()}</td>
        <td>${paidBy}</td>
        <td>${splitBetween}</td>
      </tr>
    `;
  });

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  let memberBalances = '';
  trip.members.forEach(m => {
    const paid = trip.expenses.filter(e => e.paidById === m.id).reduce((sum, e) => sum + e.amount, 0);
    const deposited = (trip.deposits || []).filter(d => d.memberId === m.id).reduce((sum, d) => sum + d.amount, 0);
    
    const share = trip.expenses.reduce((sum, e) => {
      const s = e.splits.find(sp => sp.memberId === m.id);
      return sum + (s ? s.amount : 0);
    }, 0);
    
    const balance = (paid + deposited) - share;
    const color = balance >= 0 ? '#10B981' : '#EF4444';
    
    memberBalances += `
      <tr>
        <td>${m.name}</td>
        <td>৳${paid.toLocaleString()}</td>
        <td>৳${deposited.toLocaleString()}</td>
        <td>৳${share.toLocaleString()}</td>
        <td style="color: ${color}; font-weight: bold;">${balance >= 0 ? '+' : ''}৳${balance.toLocaleString()}</td>
      </tr>
    `;
  });

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #4F46E5; margin-bottom: 5px; }
          .subtitle { color: #666; font-size: 16px; margin-bottom: 30px; }
          
          h2 { color: #4F46E5; margin-top: 40px; font-size: 20px; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
          th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #E5E7EB; }
          th { background-color: #F9FAFB; color: #4B5563; font-weight: 600; text-transform: uppercase; font-size: 12px; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          
          .summary-card { background-color: #EEF2FF; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
          .summary-card p { margin: 5px 0; font-size: 16px; }
          .total { font-size: 24px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <h1>${trip.name}</h1>
        <div class="subtitle">Location: ${trip.destination || 'Not specified'}</div>
        
        <div class="summary-card">
          <p><strong>Total Trip Expenses:</strong> <span class="total">৳${totalSpent.toLocaleString()}</span></p>
          <p><strong>Total Members:</strong> ${trip.members.length}</p>
        </div>

        <h2>Member Balances</h2>
        <table>
          <tr>
            <th>Member</th>
            <th>Paid Direct</th>
            <th>Fund Deposited</th>
            <th>Total Share</th>
            <th>Net Balance</th>
          </tr>
          ${memberBalances}
        </table>

        <h2>Detailed Expenses</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split Between</th>
          </tr>
          ${tableRows}
        </table>
        
        <div style="margin-top: 50px; text-align: center; color: #9CA3AF; font-size: 12px;">
          Generated by TourMate • ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (err) {
    console.error('Failed to export PDF:', err);
  }
};
