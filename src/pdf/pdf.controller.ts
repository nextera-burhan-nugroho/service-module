import {
    Controller,
    Post,
    Body,
    Res,
    HttpException,
    HttpStatus,
    Get,
    Query,
    UploadedFile,
    UseInterceptors,
    Param,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Multer } from 'multer';
import { PdfService } from './pdf.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TableContentDto } from './pdf.dto';

// DTOs for request validation
class TextContentDto {
    text: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    fontName?: string;
    addToIndex?: boolean;
}

class ImageContentDto {
    width?: number;
    height?: number;
    format?: string;
}

class GeneratePdfDto {
    title?: string;
    contents: Array<{
        type: 'text' | 'table' | 'newPage' | 'newLine' | 'image';
        data?: any;
        options?: any;
    }>;
    defaultFont?: string;
    returnBuffer?: boolean; // If true, returns buffer instead of saving file
}

@ApiTags('PDF')
@Controller('pdf')
export class PdfController {
    private readonly publicDir = join(process.cwd(), 'public', 'pdfs');

    constructor(private readonly pdfService: PdfService) {
        // Ensure public/pdfs directory exists
        const fs = require('fs');
        if (!fs.existsSync(this.publicDir)) {
            fs.mkdirSync(this.publicDir, { recursive: true });
        }
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate PDF with multiple content types' })
    @ApiBody({ type: GeneratePdfDto })
    @ApiResponse({
        status: 200,
        description: 'PDF generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                filePath: { type: 'string' },
                publicUrl: { type: 'string' },
                filename: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 500, description: 'Failed to generate PDF' })
    async generatePdf(@Body() generatePdfDto: GeneratePdfDto, @Res() res: Response) {
        try {
            // Reset service for new PDF generation
            this.pdfService.reset();

            // Generate unique filename
            const filename = `pdf_${uuidv4()}.pdf`;
            const filePath = join(this.publicDir, filename);

            // Set custom file path for this generation
            this.pdfService.setFilePath(filePath);

            // Set default font if provided
            if (generatePdfDto.defaultFont) {
                this.pdfService.setDefaultFont(generatePdfDto.defaultFont);
            }

            // Add title if provided
            if (generatePdfDto.title) {
                this.pdfService.addText(generatePdfDto.title, {
                    fontSize: 18,
                    fontStyle: 'bold',
                    addToIndex: true
                });
                this.pdfService.addNewLine(2);
            }

            // Process contents
            for (const content of generatePdfDto.contents) {
                await this.processContent(content);
            }

            // Return PDF
            if (generatePdfDto.returnBuffer) {
                const buffer = this.pdfService.getBuffer();
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="generated.pdf"',
                    'Content-Length': buffer.length.toString(),
                });
                res.send(buffer);
            } else {
                const savedFilePath = await this.pdfService.render();
                res.json({
                    success: true,
                    message: 'PDF generated successfully',
                    filePath: savedFilePath,
                    publicUrl: `/pdf/view/${filename}`,
                    filename: filename
                });
            }
        } catch (error) {
            throw new HttpException(
                `Failed to generate PDF: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('generate-simple')
    @ApiOperation({ summary: 'Generate simple text PDF' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'My Document' },
                content: { type: 'string', example: 'This is the main content of the PDF.' },
                fontSize: { type: 'number', example: 12 },
                fontStyle: { type: 'string', enum: ['normal', 'bold', 'italic', 'bolditalic'] },
                returnBuffer: { type: 'boolean', default: false }
            },
            required: ['content']
        }
    })
    async generateSimplePdf(@Body() body: any, @Res() res: Response) {
        try {
            this.pdfService.reset();

            const filename = `simple_${uuidv4()}.pdf`;
            const filePath = join(this.publicDir, filename);
            this.pdfService.setFilePath(filePath);

            if (body.title) {
                this.pdfService.addText(body.title, {
                    fontSize: 16,
                    fontStyle: 'bold',
                    addToIndex: true
                });
                this.pdfService.addNewLine(2);
            }

            this.pdfService.addText(body.content, {
                fontSize: body.fontSize || 12,
                fontStyle: body.fontStyle || 'normal'
            });

            if (body.returnBuffer) {
                const buffer = this.pdfService.getBuffer();
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="simple.pdf"',
                });
                res.send(buffer);
            } else {
                const savedFilePath = await this.pdfService.render();
                res.json({
                    success: true,
                    filePath: savedFilePath,
                    publicUrl: `/pdf/view/${filename}`,
                    filename: filename
                });
            }
        } catch (error) {
            throw new HttpException(
                `Failed to generate simple PDF: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('generate-table')
    @ApiOperation({ summary: 'Generate PDF with table data' })
    @ApiBody({ type: TableContentDto })
    async generateTablePdf(@Body() tableDto: TableContentDto, @Res() res: Response) {
        try {
            this.pdfService.reset();

            console.dir(tableDto)
            this.pdfService.addGenericTable(tableDto.data, {
                tableName: tableDto.tableName,
                ignoreFields: tableDto.ignoreFields || [],
                addToIndex: tableDto.addToIndex || false,
                theme: tableDto.theme || 'striped'
            });

            const buffer = this.pdfService.getBuffer();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${tableDto.tableName}.pdf"`,
            });
            res.send(buffer);
        } catch (error) {
            throw new HttpException(
                `Failed to generate table PDF: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('generate-column')
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ summary: 'Generate PDF dengan layout kolom, teks, tabel, dan chart' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Gambar chart dalam format PNG/JPEG'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'PDF berhasil dibuat',
        content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } }
    })
    async generateReport(
        @UploadedFile() image: Express.Multer.File,
        @Res() res: Response
    ) {
        if (!image) {
            throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
        }

        this.pdfService.reset();

        this.pdfService.setLayoutColumns({ columns: 2, margin: 20, gap: 15 });
        this.pdfService.addText('Laporan Penjualan 2023 \n'.repeat(5));
        this.pdfService.addImage(image.buffer);
        this.pdfService.addGenericTable([
            { produk: 'A', qty: 100 },
            { produk: 'B', qty: 150 },
        ],
            { tableName: 'Penjualan', ignoreFields: [] },
        );

        this.pdfService.startRow();
        this.pdfService.addCol(6, () => {
            this.pdfService.addText('Laporan Penjualan 2023');
        });
        this.pdfService.addCol(6, () => {
            this.pdfService.addImage(image.buffer, { height: 150 });
        });
        this.pdfService.endRow();

        this.pdfService.startRow();
        this.pdfService.addCol(12, () => {
            this.pdfService.addGenericTable(
                [
                    { produk: 'A', qty: 100 },
                    { produk: 'B', qty: 150 },
                ],
                { tableName: 'Penjualan', ignoreFields: [] }
            );
        });
        this.pdfService.endRow();


        const buffer = this.pdfService.getBuffer();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"',
        });
        res.send(buffer);
    }

    @Post('generate-with-image')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Generate PDF with uploaded image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
                title: { type: 'string' },
                description: { type: 'string' },
                width: { type: 'number' },
                height: { type: 'number' }
            }
        }
    })
    async generatePdfWithImage(
        @UploadedFile() image: Express.Multer.File,
        @Body() body: any,
        @Res() res: Response
    ) {
        try {
            if (!image) {
                throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
            }

            this.pdfService.reset();

            if (body.title) {
                this.pdfService.addText(body.title, {
                    fontSize: 16,
                    fontStyle: 'bold'
                });
                this.pdfService.addNewLine();
            }

            this.pdfService.addImage(image.buffer, {
                width: body.width ? Number(body.width) : undefined,
                height: body.height ? Number(body.height) : undefined,
                format: image.mimetype.includes('png') ? 'PNG' : 'JPEG'
            });

            if (body.description) {
                this.pdfService.addNewLine();
                this.pdfService.addText(body.description);
            }

            const buffer = this.pdfService.getBuffer();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="image-document.pdf"',
            });
            res.send(buffer);
        } catch (error) {
            throw new HttpException(
                `Failed to generate PDF with image: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('view/:filename')
    @ApiOperation({ summary: 'View/Download generated PDF file' })
    @ApiResponse({ status: 200, description: 'PDF file served successfully' })
    @ApiResponse({ status: 404, description: 'PDF file not found' })
    async viewPdf(@Param('filename') filename: string, @Res() res: Response) {
        try {
            const filePath = join(this.publicDir, filename);

            if (!existsSync(filePath)) {
                throw new HttpException('PDF file not found', HttpStatus.NOT_FOUND);
            }

            const file = createReadStream(filePath);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`, // inline to display in browser
            });

            file.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                `Failed to serve PDF: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('download/:filename')
    @ApiOperation({ summary: 'Force download PDF file' })
    @ApiResponse({ status: 200, description: 'PDF file downloaded successfully' })
    @ApiResponse({ status: 404, description: 'PDF file not found' })
    async downloadPdf(@Param('filename') filename: string, @Res() res: Response) {
        try {
            const filePath = join(this.publicDir, filename);

            if (!existsSync(filePath)) {
                throw new HttpException('PDF file not found', HttpStatus.NOT_FOUND);
            }

            const file = createReadStream(filePath);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`, // attachment to force download
            });

            file.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                `Failed to download PDF: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('list')
    @ApiOperation({ summary: 'List all generated PDF files' })
    @ApiResponse({
        status: 200,
        description: 'List of PDF files',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            filename: { type: 'string' },
                            viewUrl: { type: 'string' },
                            downloadUrl: { type: 'string' },
                            createdAt: { type: 'string' }
                        }
                    }
                }
            }
        }
    })
    async listPdfFiles() {
        try {
            const fs = require('fs');
            const files = fs.readdirSync(this.publicDir)
                .filter((file: string) => file.endsWith('.pdf'))
                .map((file: string) => {
                    const filePath = join(this.publicDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        viewUrl: `/pdf/view/${file}`,
                        downloadUrl: `/pdf/download/${file}`,
                        createdAt: stats.birthtime.toISOString()
                    };
                })
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return { files };
        } catch (error) {
            throw new HttpException(
                `Failed to list PDF files: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('fonts')
    @ApiOperation({ summary: 'Get available fonts' })
    @ApiResponse({
        status: 200,
        description: 'List of available fonts',
        schema: {
            type: 'object',
            properties: {
                fonts: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    })
    getAvailableFonts() {
        try {
            // Create temporary service instance to get fonts
            this.pdfService.reset();
            const fonts = this.pdfService.getAvailableFonts();
            return { fonts };
        } catch (error) {
            throw new HttpException(
                `Failed to get available fonts: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('template/report')
    @ApiOperation({ summary: 'Generate report template PDF' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                reportTitle: { type: 'string', example: 'Monthly Sales Report' },
                author: { type: 'string', example: 'John Doe' },
                date: { type: 'string', example: '2024-01-01' },
                summary: { type: 'string' },
                tableData: {
                    type: 'array',
                    items: { type: 'object' }
                },
                conclusions: { type: 'string' }
            }
        }
    })
    async generateReportTemplate(@Body() reportData: any, @Res() res: Response) {
        try {
            this.pdfService.reset();

            // Title Page
            this.pdfService.addText(reportData.reportTitle || 'Report', {
                fontSize: 24,
                fontStyle: 'bold',
                addToIndex: true
            });
            this.pdfService.addNewLine(2);

            if (reportData.author) {
                this.pdfService.addText(`Author: ${reportData.author}`, {
                    fontSize: 12
                });
            }

            if (reportData.date) {
                this.pdfService.addText(`Date: ${reportData.date}`, {
                    fontSize: 12
                });
            }

            this.pdfService.addNewPage();

            // Summary Section
            if (reportData.summary) {
                this.pdfService.addText('Executive Summary', {
                    fontSize: 16,
                    fontStyle: 'bold',
                    addToIndex: true
                });
                this.pdfService.addNewLine();
                this.pdfService.addText(reportData.summary);
                this.pdfService.addNewLine(2);
            }

            // Data Table Section
            if (reportData.tableData && reportData.tableData.length > 0) {
                this.pdfService.addGenericTable(reportData.tableData, {
                    tableName: 'Data Analysis',
                    addToIndex: true,
                    theme: 'grid'
                });
                this.pdfService.addNewLine(2);
            }

            // Conclusions Section
            if (reportData.conclusions) {
                this.pdfService.addText('Conclusions', {
                    fontSize: 16,
                    fontStyle: 'bold',
                    addToIndex: true
                });
                this.pdfService.addNewLine();
                this.pdfService.addText(reportData.conclusions);
            }

            const buffer = this.pdfService.getBuffer();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${reportData.reportTitle || 'report'}.pdf"`,
            });
            res.send(buffer);
        } catch (error) {
            throw new HttpException(
                `Failed to generate report: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async processContent(content: any): Promise<void> {
        switch (content.type) {
            case 'text':
                this.pdfService.addText(content.data, content.options);
                break;
            case 'table':
                this.pdfService.addGenericTable(content.data.tableData, {
                    tableName: content.data.tableName,
                    ignoreFields: content.data.ignoreFields || [],
                    addToIndex: content.options?.addToIndex || false,
                    ...content.options
                });
                break;
            case 'newPage':
                this.pdfService.addNewPage();
                break;
            case 'newLine':
                this.pdfService.addNewLine(content.options?.count || 1);
                break;
            case 'image':
                if (content.data) {
                    this.pdfService.addImage(Buffer.from(content.data, 'base64'), content.options);
                }
                break;
            default:
                throw new Error(`Unknown content type: ${content.type}`);
        }
    }
}