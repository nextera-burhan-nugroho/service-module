import { Module } from '@nestjs/common';
import { HegService } from './heg.service';
import { HttpModule } from '@nestjs/axios';
import { HegController } from './heg.controller';

@Module({
  imports: [HttpModule],
  providers: [HegService],
  controllers: [HegController]
})
export class HegModule { }
