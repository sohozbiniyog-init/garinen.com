// CSV Export Utility
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const headers = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  );

  // Create CSV content
  const csvContent = [
    // Header row
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareBookingsForCSV(bookings: any[]): Record<string, any>[] {
  return bookings.map((booking) => ({
    'Booking ID': booking.id,
    'Buyer Name': booking.user?.name || 'N/A',
    'Buyer Email': booking.user?.email || 'N/A',
    'Buyer Phone': booking.user?.phone || 'N/A',
    'Address': booking.address || 'N/A',
    'Profession': booking.profession || 'N/A',
    'Listing Title': booking.listing?.title || 'N/A',
    'Car Price': `৳ ${booking.listing?.price || 'N/A'}`,
    'Deposit Amount': `৳ ${booking.depositAmount || 'N/A'}`,
    'Status': booking.status || 'PENDING',
    'Payment Status': booking.paymentStatus || 'PENDING',
    'Created Date': new Date(booking.createdAt).toLocaleDateString(),
  }));
}

export function prepareTestDrivesForCSV(bookings: any[]): Record<string, any>[] {
  return bookings
    .filter((b) => b.status === 'TEST_DRIVE')
    .map((booking) => ({
      'Booking ID': booking.id,
      'Buyer Name': booking.user?.name || 'N/A',
      'Buyer Email': booking.user?.email || 'N/A',
      'Buyer Phone': booking.user?.phone || 'N/A',
      'Listing Title': booking.listing?.title || 'N/A',
      'Status': 'Test Drive',
      'Scheduled Date': booking.emiDetails?.preferredDate || 'N/A',
      'Scheduled Time': booking.emiDetails?.preferredTime || 'N/A',
      'Created Date': new Date(booking.createdAt).toLocaleDateString(),
    }));
}

export function prepareLoansForCSV(loans: any[]): Record<string, any>[] {
  return loans.map((loan) => ({
    'Loan ID': loan.id,
    'Applicant Name': loan.name || 'N/A',
    'Applicant Email': loan.email || 'N/A',
    'Applicant Phone': loan.phone || 'N/A',
    'Loan Amount': loan.amount ? `৳ ${loan.amount}` : 'N/A',
    'Status': loan.status || 'DRAFT',
    'Submitted Date': loan.submittedAt ? new Date(loan.submittedAt).toLocaleDateString() : 'Not Submitted',
    'Created Date': new Date(loan.createdAt).toLocaleDateString(),
  }));
}
