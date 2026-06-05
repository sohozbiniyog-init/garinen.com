// CSV Export Utility
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
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

export function prepareBookingsForCSV(bookings: unknown[]): Record<string, unknown>[] {
  return bookings.map((booking) => {
    const b = booking as Record<string, unknown>;
    return {
      'Booking ID': b['id'] ?? 'N/A',
      'Buyer Name': (b['user'] as Record<string, unknown> | undefined)?.['name'] ?? 'N/A',
      'Buyer Email': (b['user'] as Record<string, unknown> | undefined)?.['email'] ?? 'N/A',
      'Buyer Phone': (b['user'] as Record<string, unknown> | undefined)?.['phone'] ?? 'N/A',
      'Address': b['address'] ?? 'N/A',
      'Profession': b['profession'] ?? 'N/A',
      'Listing Title': (b['listing'] as Record<string, unknown> | undefined)?.['title'] ?? 'N/A',
      'Car Price': `৳ ${(b['listing'] as Record<string, unknown> | undefined)?.['price'] ?? 'N/A'}`,
      'Deposit Amount': `৳ ${b['depositAmount'] ?? 'N/A'}`,
      'Status': b['status'] ?? 'PENDING',
      'Payment Status': b['paymentStatus'] ?? 'PENDING',
      'Created Date': new Date(String(b['createdAt'] ?? '')).toLocaleDateString(),
    };
  });
}

export function prepareTestDrivesForCSV(testDrives: unknown[]): Record<string, unknown>[] {
  return testDrives.map((td) => {
    const t = td as Record<string, unknown>;
    return {
      'Request ID': t['id'] ?? 'N/A',
      'Name': t['name'] ?? 'N/A',
      'Email': t['email'] ?? 'N/A',
      'Phone': t['phone'] ?? 'N/A',
      'Preferred Date': t['preferredDate'] ?? 'N/A',
      'Preferred Time': t['preferredTime'] ?? 'N/A',
      'Listing ID': t['listingId'] ?? 'N/A',
      'Notes': t['notes'] ?? 'N/A',
      'Status': t['status'] ?? 'PENDING',
      'Created Date': new Date(String(t['createdAt'] ?? '')).toLocaleDateString(),
    };
  });
}

export function prepareLoansForCSV(loans: unknown[]): Record<string, unknown>[] {
  return loans.map((loan) => {
    const l = loan as Record<string, unknown>;
    return {
      'Loan ID': l['id'] ?? 'N/A',
      'Applicant Name': l['name'] ?? 'N/A',
      'Applicant Email': l['email'] ?? 'N/A',
      'Applicant Phone': l['phone'] ?? 'N/A',
      'Loan Amount': l['amount'] ? `৳ ${l['amount']}` : 'N/A',
      'Status': l['status'] ?? 'DRAFT',
      'Submitted Date': l['submittedAt'] ? new Date(String(l['submittedAt'])).toLocaleDateString() : 'Not Submitted',
      'Created Date': new Date(String(l['createdAt'] ?? '')).toLocaleDateString(),
    };
  });
}
