import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    // Configure Multer for file uploads
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    // Serve static files from public directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public',
    }),
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService], // Export service for use in other modules
})
export class PdfModule { }
