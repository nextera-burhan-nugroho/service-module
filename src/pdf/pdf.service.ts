import { Injectable, Logger } from '@nestjs/common';
import jsPDF from 'jspdf';
import { ColumnLayoutOptions, index, TableOptions, TextOptions } from './pdf.interface';
import autoTable from 'jspdf-autotable';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);
    private doc: jsPDF;
    private filePath = './output.pdf';
    private readonly footerMargin = 50;
    private readonly defaultFontName = 'helvetica';
    private indexData: index[] = [];

    // posisi & layout
    private x = 0;
    private y = 0;
    private columnWidth = 0;
    private pageHeight = 0;

    // layout config
    private columns = 1;
    private margin = 20;
    private gap = 10;

    // row/col system
    private cursorX = 0;
    private currentY = 0;
    private rowHeight = 0;
    private colWidth = 0;
    private colHeights: number[] = [];
    private pageWidth = 0;
    private contentWidth = 0; // Available width for content within columns
    private isInRowMode = false; // Track if we're currently in a row/col layout

    // track current column saat "column flow"
    private currentCol = 0;

    constructor() {
        this.doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        this.doc.setFont(this.defaultFontName);
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.setupColumns({ columns: 1, margin: 20, gap: 10 });
        this.resetPosition();
    }

    // ========== Layout Setup ==========
    private setupColumns(options: ColumnLayoutOptions) {
        this.columns = options.columns || 1;
        this.gap = options.gap || 20;
        this.margin = options.margin || 20;

        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();

        this.columnWidth =
            (this.pageWidth - this.margin * 2 - this.gap * (this.columns - 1)) / this.columns;

        // Set content width for proper text wrapping
        this.contentWidth = this.columnWidth;
    }

    setLayoutColumns(options: ColumnLayoutOptions) {
        this.setupColumns(options);
        this.resetPosition();
    }

    private resetPosition(): void {
        this.x = this.margin;
        this.y = this.margin;
    }

    private getAvailablePageHeight(): number {
        return this.pageHeight - this.margin - this.footerMargin;
    }

    private checkPageBreak(requiredHeight = 50): void {
        if (this.y + requiredHeight > this.getAvailablePageHeight()) {
            this.addNewPage();
        }
    }

    // ========== Row/Col Layout ==========
    startRow() {
        this.cursorX = this.margin;
        this.rowHeight = 0;
        this.currentY = this.y;
        // Fix: Calculate column width properly with margins and gaps
        const availableWidth = this.pageWidth - (this.margin * 2);
        const totalGaps = 11 * 10; // 11 gaps between 12 columns, 10pt each
        this.colWidth = (availableWidth - totalGaps) / 12;
        this.colHeights = [];
        this.isInRowMode = true; // Enable row mode
    }

    addCol(span: number, contentFn: () => void) {
        const colX = this.cursorX;
        const width = this.colWidth * span + (span - 1) * 10; // Include gaps in width calculation
        const startY = this.currentY;

        // Save old position
        const oldX = this.x;
        const oldY = this.y;
        const oldContentWidth = this.contentWidth;

        // Set position and content width for this column
        this.x = colX;
        this.y = startY; // Always start at the same Y position for all columns in the row
        this.contentWidth = width; // Set available width for content

        // Render content in this column
        contentFn();

        // Calculate column height
        const endY = this.y;
        const colHeight = endY - startY;
        this.colHeights.push(colHeight);

        // Move cursor to next column position
        this.cursorX = colX + width + 10; // Add gap after column

        // Restore content width but keep Y at row start for next column
        this.contentWidth = oldContentWidth;
        this.x = oldX;
        this.y = startY; // Keep Y at row start, not currentY
    }

    endRow() {
        // Get maximum height from all columns
        const maxHeight = Math.max(...this.colHeights, 0);
        this.y = this.currentY + maxHeight + 20; // Move to next row
        this.colHeights = [];
        this.cursorX = this.margin; // Reset cursor to start
        this.isInRowMode = false; // Disable row mode
    }

    // ========== Column Flow ==========
    private nextColumnOrPage(): void {
        this.currentCol++;
        if (this.currentCol >= this.columns) {
            this.addNewPage();
            this.currentCol = 0;
        }
        this.x = this.margin + (this.currentCol * (this.columnWidth + this.gap));
        this.y = this.margin;
    }

    // ========== Basic Elements ==========
    addNewPage(): void {
        this.doc.addPage();
        this.resetPosition();
    }

    addText(text: string, options?: TextOptions): void {
        if (!text?.trim()) return;

        const fontSize = options?.fontSize || 12;
        this.doc.setFontSize(fontSize);

        // Use contentWidth for proper text wrapping within columns
        const maxWidth = this.contentWidth || this.columnWidth;
        const lines = this.doc.splitTextToSize(text, maxWidth);
        const textHeight = this.doc.getTextDimensions(lines).h;

        if (this.y + textHeight > this.getAvailablePageHeight()) {
            this.nextColumnOrPage();
        }

        // Add small baseline adjustment for better alignment in row mode
        const baselineOffset = this.isInRowMode ? fontSize * 0.8 : 0;
        this.doc.text(lines, this.x, this.y + baselineOffset);

        // Only advance Y if not in row mode
        if (!this.isInRowMode) {
            this.y += textHeight + this.doc.getLineHeight();
        } else {
            this.y += textHeight;
        }
    }

    addImage(imageData: Buffer, options?: { width?: number; height?: number; format?: string }) {
        const format = options?.format || 'JPEG';
        // Use contentWidth to constrain image width within columns
        const maxWidth = this.contentWidth || this.columnWidth;
        const width = options?.width ? Math.min(options.width, maxWidth) : maxWidth;
        const height = options?.height || 200;

        if (this.y + height > this.getAvailablePageHeight()) {
            this.nextColumnOrPage();
        }

        this.doc.addImage(imageData, format, this.x, this.y, width, height);
        // Only advance Y if not in row mode
        if (!this.isInRowMode) {
            this.y += height + this.doc.getLineHeight();
        } else {
            this.y += height;
        }
    }

    addGenericTable<T extends Record<string, any>>(dataArr: T[], options: TableOptions): void {
        if (!dataArr?.length) return;

        if (options.tableName) {
            this.addText(options.tableName, {
                addToIndex: options.addToIndex,
                fontSize: 14,
                fontStyle: 'bold',
            });
            this.addNewLine();
        }

        if (this.y + 100 > this.getAvailablePageHeight()) {
            this.nextColumnOrPage();
        }

        const firstItem = dataArr[0];
        const headers = Object.keys(firstItem).filter(
            (key) => !options.ignoreFields?.includes(key),
        );
        const body = dataArr.map((item: T) =>
            headers.map((key) => (item[key] instanceof Date ? item[key].toISOString().split('T')[0] : item[key] ?? ''))
        );

        // Calculate available width for table within current column
        const tableWidth = this.contentWidth || this.columnWidth;
        const rightMargin = this.pageWidth - this.x - tableWidth;

        autoTable(this.doc, {
            head: [headers],
            body,
            startY: this.y,
            margin: { left: this.x, right: rightMargin },
            tableWidth: tableWidth,
            styles: {
                fontSize: 10,
                cellPadding: 3,
                font: this.defaultFontName,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: 'bold',
                font: this.defaultFontName,
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            ...options,
        });

        // Only advance Y if not in row mode
        if (!this.isInRowMode) {
            this.y = (this.doc as any).lastAutoTable.finalY + this.doc.getLineHeight();
        } else {
            this.y = (this.doc as any).lastAutoTable.finalY;
        }
    }

    addNewLine(count = 1): void {
        this.y += this.doc.getLineHeight() * count;
        this.x = this.margin;
        this.checkPageBreak();
    }

    // ========== Page & TOC ==========
    private addPageNumbers(): void {
        const pageCount = this.doc.getNumberOfPages();
        const originalFontSize = this.doc.getFontSize();
        const originalFont = this.doc.getFont();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(10);
            this.doc.setFont(this.defaultFontName, 'normal');
            this.doc.text(
                `Page ${i} of ${pageCount}`,
                this.margin,
                this.doc.internal.pageSize.height - this.margin / 2,
            );
        }

        this.doc.setFontSize(originalFontSize);
        this.doc.setFont(originalFont.fontName, originalFont.fontStyle);
    }

    private addIndex(): void {
        this.doc.insertPage(2);
        this.doc.setPage(2);
        this.resetPosition();

        const updatedIndexData = this.indexData.map(item => ({
            ...item,
            Page: item.Page + 1
        }));

        this.addGenericTable(updatedIndexData, {
            tableName: 'Table of Contents',
            ignoreFields: [],
            addToIndex: false,
        });
    }

    // ========== Output ==========
    async render(): Promise<string> {
        this.addPageNumbers();
        if (this.indexData.length > 0) this.addIndex();

        return new Promise<string>((resolve, reject) => {
            try {
                this.doc.save(this.filePath);
                resolve(this.filePath);
            } catch (error) {
                reject(error);
            }
        });
    }

    getBuffer(): Buffer {
        this.addPageNumbers();
        if (this.indexData.length > 0) this.addIndex();

        return Buffer.from(this.doc.output('arraybuffer'));
    }

    setFilePath(path: string): void {
        this.filePath = path;
    }

    reset(): void {
        this.doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        this.doc.setFont(this.defaultFontName);
        this.indexData = [];
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.setupColumns({ columns: 1, margin: 20, gap: 10 });
        this.resetPosition();
    }

    setDefaultFont(fontName: string): void {
        this.doc.setFont(fontName);
    }

    getAvailableFonts(): string[] {
        return Object.keys((this.doc as any).getFontList());
    }
}
