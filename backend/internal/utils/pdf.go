package utils

import (
	"fmt"
	"github.com/jung-kurt/gofpdf"
)

type PDFData struct {
	InvoiceNo   string
	Date        string
	DueDate     string
	Customer    string
	Address     string
	Items       []PDFItem
	SubTotal    float64
	Discount    float64
	Tax         float64
	Total       float64
	Currency    string
}

type PDFItem struct {
	Name     string
	Quantity int
	Price    float64
	Total    float64
}

func GenerateInvoicePDF(data PDFData) (*gofpdf.Fpdf, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Header
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "NETAXIS INVOICE")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Invoice No: %s", data.InvoiceNo))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Date: %s", data.Date))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Due Date: %s", data.DueDate))
	pdf.Ln(15)

	// Customer Info
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Bill To:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, data.Customer)
	pdf.Ln(8)
	pdf.Cell(40, 10, data.Address)
	pdf.Ln(20)

	// Table Header
	pdf.SetFillColor(240, 240, 240)
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(100, 10, "Item", "1", 0, "L", true, 0, "")
	pdf.CellFormat(30, 10, "Qty", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 10, "Price", "1", 0, "R", true, 0, "")
	pdf.CellFormat(30, 10, "Total", "1", 0, "R", true, 0, "")
	pdf.Ln(10)

	// Items
	pdf.SetFont("Arial", "", 12)
	for _, item := range data.Items {
		pdf.CellFormat(100, 10, item.Name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%.2f", item.Price), "1", 0, "R", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%.2f", item.Total), "1", 0, "R", false, 0, "")
		pdf.Ln(10)
	}

	pdf.Ln(10)
	// Totals
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(160, 10, "Subtotal", "0", 0, "R", false, 0, "")
	pdf.CellFormat(30, 10, fmt.Sprintf("%s%.2f", data.Currency, data.SubTotal), "0", 0, "R", false, 0, "")
	pdf.Ln(8)
	pdf.CellFormat(160, 10, "Discount", "0", 0, "R", false, 0, "")
	pdf.CellFormat(30, 10, fmt.Sprintf("%s%.2f", data.Currency, data.Discount), "0", 0, "R", false, 0, "")
	pdf.Ln(8)
	pdf.CellFormat(160, 10, "Tax", "0", 0, "R", false, 0, "")
	pdf.CellFormat(30, 10, fmt.Sprintf("%s%.2f", data.Currency, data.Tax), "0", 0, "R", false, 0, "")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(160, 10, "Total", "0", 0, "R", false, 0, "")
	pdf.CellFormat(30, 10, fmt.Sprintf("%s%.2f", data.Currency, data.Total), "0", 0, "R", false, 0, "")

	return pdf, nil
}
