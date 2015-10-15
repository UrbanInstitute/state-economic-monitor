import pdfkit

pdfkit.from_url('http://localhost:5000/employment_pdf.html', 'out.pdf')